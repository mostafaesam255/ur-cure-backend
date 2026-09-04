import zipfile
import os
import time

def extract_zip(zip_path, target_dir):
    if not os.path.exists(zip_path):
        print(f"Zip file not found: {zip_path}")
        return 0

    print(f"Opening archive: {zip_path}...")
    start_time = time.time()
    count = 0
    with zipfile.ZipFile(zip_path, 'r') as z:
        for member in z.infolist():
            if member.is_dir():
                continue
            filename = os.path.basename(member.filename)
            if not filename:
                continue
            dest_path = os.path.join(target_dir, filename)
            # Only extract if file doesn't exist yet
            if not os.path.exists(dest_path):
                with z.open(member) as source, open(dest_path, "wb") as dest:
                    dest.write(source.read())
            count += 1
            if count % 5000 == 0:
                print(f"  Extracted {count} images so far...")
    
    elapsed = time.time() - start_time
    print(f"Finished {os.path.basename(zip_path)}: {count} images in {elapsed:.2f}s")
    return count

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    target_dir = os.path.join(base_dir, "uploads", "images")
    os.makedirs(target_dir, exist_ok=True)

    parent_dir = os.path.abspath(os.path.join(base_dir, ".."))
    zip1 = os.path.join(parent_dir, "images-20260720T173822Z-1-001.zip")
    zip2 = os.path.join(parent_dir, "images-20260720T173822Z-1-002.zip")

    print(f"Target upload directory: {target_dir}")
    total1 = extract_zip(zip1, target_dir)
    total2 = extract_zip(zip2, target_dir)
    
    total = len(os.listdir(target_dir))
    print(f"==> Total images ready in {target_dir}: {total} images")

if __name__ == "__main__":
    main()
