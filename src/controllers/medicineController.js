const db = require('../config/db');
const { normalizeArabic } = require('../utils/arabicNormalizer');
const { formatMedicineRow } = require('../utils/formatters');
const { buildCategoryWhereClause } = require('../services/clinicalRules');

// 1. GET /api/medicines (Search, Categories, Pagination)
function getMedicines(req, res) {
  const rawQuery = (req.query.q || '').trim();
  const query = normalizeArabic(rawQuery);
  const category = (req.query.category || '').trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (query) {
    const words = query.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0) {
      const wordClauses = words.map(() => 'search_text LIKE ?');
      whereClauses.push(`(${wordClauses.join(' AND ')})`);
      words.forEach(w => {
        params.push(`%${w}%`);
      });
    }
  }

  if (category && category !== 'الكل' && category !== 'All') {
    whereClauses.push(buildCategoryWhereClause(category));
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total matching count
  const countSql = `SELECT COUNT(*) AS total FROM medicines ${whereSql}`;
  db.get(countSql, params, (err, countRow) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    const total = countRow ? countRow.total : 0;

    const exactWordAr = `${query}`;
    const exactWordEn = `${query}`;
    const prefixStartAr = `${query}%`;
    const prefixStartEn = `${query}%`;

    const dataSql = `
      SELECT * FROM medicines ${whereSql} 
      ORDER BY 
        -- Rank 0: Exact or Prefix Start Match
        CASE 
          WHEN LOWER(name_ar) = ? OR LOWER(name_en) = ? THEN 0
          WHEN LOWER(name_ar) LIKE ? OR LOWER(name_en) LIKE ? THEN 1
          ELSE 2
        END ASC,

        -- Rank 1: Essential Oral Medicines, Tablets, Capsules & Top Pharmacy Brands
        CASE 
          WHEN (
            LOWER(name_ar) LIKE '%قرص%' OR LOWER(name_ar) LIKE '%كبسول%' OR LOWER(name_en) LIKE '%tablet%' OR LOWER(name_en) LIKE '%cap%' 
            OR LOWER(name_en) LIKE '%limitless%' OR LOWER(name_ar) LIKE '%ليمتلس%' 
            OR LOWER(name_en) LIKE '%centrum%' OR LOWER(name_ar) LIKE '%سنتروم%' 
            OR LOWER(name_en) LIKE '%panadol%' OR LOWER(name_ar) LIKE '%بنادول%'
            OR LOWER(name_en) LIKE '%vidrop%' OR LOWER(name_ar) LIKE '%فيدروب%' 
            OR LOWER(name_en) LIKE '%eva%' OR LOWER(name_ar) LIKE '%ايفا%'
            OR LOWER(name_en) LIKE '%starville%' OR LOWER(name_ar) LIKE '%ستارفيل%'
            OR LOWER(name_en) LIKE '%shaan%' OR LOWER(name_ar) LIKE '%شان%'
            OR LOWER(name_en) LIKE '%acm%' OR LOWER(name_ar) LIKE '%بانثينول%'
            OR LOWER(name_en) LIKE '%glucophage%' OR LOWER(name_ar) LIKE '%جلوكوفاج%'
            OR LOWER(name_en) LIKE '%duphalac%' OR LOWER(name_ar) LIKE '%دوفلاك%'
            OR LOWER(name_en) LIKE '%devarol%' OR LOWER(name_ar) LIKE '%ديفارول%'
            OR LOWER(name_en) LIKE '%iverzine%' OR LOWER(name_ar) LIKE '%ايفرزين%'
            OR LOWER(name_en) LIKE '%zinc%' OR LOWER(name_ar) LIKE '%زنك%'
            OR LOWER(name_en) LIKE '%omega%' OR LOWER(name_ar) LIKE '%اوميجا%'
          ) THEN 0
          ELSE 1
        END ASC,

        -- Rank 2: Prefer Items with High-Res Product Images
        CASE WHEN has_local_image = 1 THEN 0 ELSE 1 END ASC,

        -- Rank 3: Higher Price / Premium Brands
        price DESC,
        id ASC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, exactWordAr, exactWordEn, prefixStartAr, prefixStartEn, limit, offset];

    db.all(dataSql, dataParams, (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }

      const formatted = rows.map((r) => formatMedicineRow(req, r));

      res.json({
        success: true,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
        data: formatted,
      });
    });
  });
}

// 2. GET /api/medicines/:id (Single medicine details)
function getMedicineById(req, res) {
  const sql = `SELECT * FROM medicines WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(404).json({ success: false, message: 'Medicine not found' });

    res.json({
      success: true,
      data: formatMedicineRow(req, row),
    });
  });
}

// 3. GET /api/categories (Top categories with count)
function getCategories(req, res) {
  const sql = `
    SELECT category, COUNT(*) as count 
    FROM medicines 
    WHERE category IS NOT NULL AND category != '' 
    GROUP BY category 
    ORDER BY count DESC 
    LIMIT 15
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({
      success: true,
      data: rows.map(r => ({ name: r.category, count: r.count })),
    });
  });
}

// 4. POST /api/medicines (Add new medicine)
function createMedicine(req, res) {
  const { nameArabic, nameEnglish, price, category, descArabic, imageUrl } = req.body;
  const id = `med_${Date.now()}`;
  const sql = `
    INSERT INTO medicines (id, name_ar, name_en, price, category, active_ingredients, image_url, search_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const searchText = `${nameArabic} ${nameEnglish} ${category}`.toLowerCase();
  db.run(sql, [id, nameArabic, nameEnglish || '', price || 0, category || 'أدوية عامة', descArabic || '', imageUrl || '', searchText], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, id: id, message: 'Medicine inserted into SQLite DB' });
  });
}

// 5. PUT /api/medicines/:id (Update medicine)
function updateMedicine(req, res) {
  const { nameArabic, nameEnglish, price, category, descArabic } = req.body;
  const id = req.params.id;
  const sql = `
    UPDATE medicines 
    SET name_ar = ?, name_en = ?, price = ?, category = ?, active_ingredients = ?, search_text = ?
    WHERE id = ?
  `;
  const searchText = `${nameArabic} ${nameEnglish} ${category}`.toLowerCase();
  db.run(sql, [nameArabic, nameEnglish, price, category, descArabic, searchText, id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Medicine updated in SQLite DB' });
  });
}

// 6. DELETE /api/medicines/:id (Delete medicine)
function deleteMedicine(req, res) {
  const sql = `DELETE FROM medicines WHERE id = ?`;
  db.run(sql, [req.params.id], function(err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: 'Medicine deleted from SQLite DB' });
  });
}

module.exports = {
  getMedicines,
  getMedicineById,
  getCategories,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};