import sqlite3
import csv
import os
import time

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_path = os.path.join(base_dir, "database.sqlite")
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "vezeeta_products_final.csv"))
    images_dir = os.path.join(base_dir, "uploads", "images")

    print(f"Database path: {db_path}")
    print(f"CSV path: {csv_path}")

    # Build local image lookup dictionary by ID stem (e.g., '143435' -> '143435.jpeg')
    local_images = {}
    if os.path.exists(images_dir):
        for fname in os.listdir(images_dir):
            stem, _ = os.path.splitext(fname)
            local_images[stem] = fname
    print(f"Found {len(local_images)} local image files in uploads directory.")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop existing table to start fresh
    cursor.execute("DROP TABLE IF EXISTS medicines")
    cursor.execute("""
    CREATE TABLE medicines (
        id TEXT PRIMARY KEY,
        product_key TEXT,
        name_ar TEXT,
        name_en TEXT,
        price REAL,
        currency_ar TEXT,
        currency_en TEXT,
        category TEXT,
        category_url_ar TEXT,
        category_url_en TEXT,
        shape_ar TEXT,
        shape_en TEXT,
        image_url TEXT,
        has_local_image INTEGER DEFAULT 0,
        local_image_path TEXT,
        active_ingredients TEXT,
        sub_categories TEXT,
        head_category_name_en TEXT,
        manufacturer TEXT,
        scientific_name TEXT,
        drug_class TEXT,
        search_text TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        pharmacy_name TEXT,
        date TEXT,
        status TEXT,
        total_price REAL,
        items_summary TEXT,
        is_emergency INTEGER DEFAULT 0,
        is_ai_verified INTEGER DEFAULT 0,
        patient_name TEXT,
        patient_phone TEXT,
        delivery_address TEXT,
        patient_latitude REAL,
        patient_longitude REAL,
        remaining_seconds INTEGER DEFAULT 300,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        medicine_id TEXT,
        name_ar TEXT,
        price REAL,
        quantity INTEGER,
        format TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (order_id)
    )
    """)

    # Group rows by normalized name to deduplicate and keep highest price
    start_time = time.time()
    grouped_rows = {}
    total_csv_rows = 0

    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_csv_rows += 1
            med_id = (row.get('\ufeffid') or row.get('id') or '').strip()
            if not med_id:
                continue

            product_key = row.get('product_key', '')
            name_ar = (row.get('product_name_ar') or '').strip()
            name_en = (row.get('product_name_en') or '').strip()
            try:
                price = float(row.get('price') or 0.0)
            except ValueError:
                price = 0.0

            currency_ar = row.get('currency_ar', 'جنيه')
            currency_en = row.get('currency_en', 'EGP')
            category = (row.get('category') or row.get('head_category_name_en') or 'العناية والعلاج').strip()
            cat_url_ar = (row.get('category_url_ar') or '').strip()
            cat_url_en = (row.get('category_url_en') or '').strip()
            shape_ar = (row.get('shape_ar') or 'علبة').strip()
            shape_en = (row.get('shape_en') or 'Box').strip()
            image_url = row.get('image_url', '').strip()
            active_ingredients = (row.get('active_ingredients') or '').strip()
            sub_categories = row.get('sub_categories', '')
            head_cat_en = row.get('head_category_name_en', '')

            has_local = 0
            local_path = None
            if med_id in local_images:
                has_local = 1
                local_path = f"/images/{local_images[med_id]}"

            search_text = f"{name_ar} {name_en} {active_ingredients} {category} {head_cat_en} {cat_url_ar} {cat_url_en}".lower()

            manufacturer = ''
            scientific_name = ''
            drug_class = ''

            item_tuple = (
                med_id, product_key, name_ar, name_en, price,
                currency_ar, currency_en, category, cat_url_ar, cat_url_en,
                shape_ar, shape_en, image_url, has_local, local_path,
                active_ingredients, sub_categories, head_cat_en,
                manufacturer, scientific_name, drug_class, search_text
            )

            # Deduplication key by normalized Arabic name or English name
            dedup_key = name_ar.lower() if name_ar else name_en.lower()
            if not dedup_key:
                dedup_key = med_id

            if dedup_key not in grouped_rows:
                grouped_rows[dedup_key] = []
            grouped_rows[dedup_key].append(item_tuple)

    # For each group, keep the item with highest price (and local image as tie-breaker)
    rows_to_insert = []
    for group_key, items in grouped_rows.items():
        # Sort items: highest price first, then has_local_image
        items.sort(key=lambda x: (x[4], x[13]), reverse=True)
        rows_to_insert.append(items[0])

    print(f"Total CSV rows parsed: {total_csv_rows}")
    print(f"Unique medicine records after deduplication (keeping highest price): {len(rows_to_insert)}")
    print(f"Removed {total_csv_rows - len(rows_to_insert)} duplicate low-priced entries.")

    cursor.executemany("""
    INSERT OR REPLACE INTO medicines (
        id, product_key, name_ar, name_en, price,
        currency_ar, currency_en, category, category_url_ar, category_url_en,
        shape_ar, shape_en, image_url, has_local_image, local_image_path,
        active_ingredients, sub_categories, head_category_name_en,
        manufacturer, scientific_name, drug_class, search_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows_to_insert)

    # --- Enrich with Ministry of Health Data from egyptian-drugs.json ---
    json_path = os.path.abspath(os.path.join(base_dir, "..", "egyptian-drugs.json"))
    if os.path.exists(json_path):
        import json, re
        print("Enriching database with Ministry of Health data from egyptian-drugs.json...")
        with open(json_path, 'r', encoding='utf-8') as jf:
            json_drugs = json.load(jf)

        norm = lambda s: re.sub(r'[^a-z0-9]', '', (s or '').lower())
        json_map = {}
        for d in json_drugs:
            name_en = d.get('commercial_name_en')
            if name_en:
                k = norm(name_en)
                if k and k not in json_map:
                    json_map[k] = d

        enriched_count = 0
        db_medicines = cursor.execute("SELECT id, name_en, name_ar, search_text FROM medicines").fetchall()
        for med in db_medicines:
            med_id, name_en, name_ar, s_text = med
            match = json_map.get(norm(name_en))
            if match:
                m_manufacturer = match.get('manufacturer', '')
                m_scientific = match.get('scientific_name', '')
                m_class = match.get('drug_class', '')
                new_search = f"{s_text} {m_manufacturer} {m_scientific} {m_class}".lower()
                cursor.execute("""
                UPDATE medicines 
                SET manufacturer = ?, scientific_name = ?, drug_class = ?, search_text = ?
                WHERE id = ?
                """, (m_manufacturer, m_scientific, m_class, new_search, med_id))
                enriched_count += 1

        print(f"==> Enriched {enriched_count} medicine records with official MOH scientific names, manufacturers & drug classes!")

    print("Creating indexes...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_name_ar ON medicines(name_ar)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_name_en ON medicines(name_en)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_category ON medicines(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_cat_url_ar ON medicines(category_url_ar)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_cat_url_en ON medicines(category_url_en)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_med_search ON medicines(search_text)")

    conn.commit()
    conn.close()

    elapsed = time.time() - start_time
    print(f"==> Deduplicated database created with {len(rows_to_insert)} medicines in {elapsed:.2f}s!")

if __name__ == "__main__":
    main()
