const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('E:/ur-cure/ur_cure_backend/database.sqlite');

function normalizeArabic(text) {
  if (!text) return '';
  let normalized = text
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\-\,\.\#\(\)]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  normalized = normalized
    .replace(/البنادول/g, 'البانادول')
    .replace(/بنادول/g, 'بانادول');
  return normalized
    .split(' ')
    .map(word => {
      if (word.startsWith('ال') && word.length > 3) {
        return word.substring(2);
      }
      return word;
    })
    .join(' ');
}

const detectedBrandName = "Panadol";
const searchNormalized = normalizeArabic(detectedBrandName);
const words = searchNormalized.split(/\s+/).filter(w => w.length > 2);
console.log("Words:", words);

let sql = `SELECT * FROM medicines WHERE search_text LIKE ? LIMIT 5`;
let params = [`%${searchNormalized}%`];

if (words.length > 0) {
  const wordClauses = words.map(() => 'search_text LIKE ?');
  sql = `SELECT * FROM medicines WHERE ${wordClauses.join(' AND ')} LIMIT 5`;
  params = words.map(w => `%${w}%`);
}

console.log("SQL:", sql);
console.log("Params:", params);

db.all(sql, params, (err, rows) => {
  if (err) {
    console.error("SQL Error:", err);
  } else {
    console.log("Matched Rows Count:", rows.length);
    console.log(rows.map(r => ({ id: r.id, name_en: r.name_en, search_text: r.search_text })));
  }
});
