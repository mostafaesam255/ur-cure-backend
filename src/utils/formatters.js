const config = require('../config/appConfig');

function resolveImageUrl(req, row) {
  if (!row) return '';
  if (row.has_local_image && row.local_image_path) {
    const protocol = req.protocol;
    const host = req.get('host') || `localhost:${config.PORT}`;
    const cleanPath = row.local_image_path.replace(/\\/g, '/');
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
    return `${protocol}://${host}${normalizedPath}`;
  }
  return row.image_url || '';
}

function formatMedicineRow(req, r) {
  if (!r) return null;
  return {
    id: r.id,
    productKey: r.product_key,
    nameArabic: r.name_ar,
    nameEnglish: r.name_en,
    price: r.price,
    currencyArabic: r.currency_ar,
    currencyEnglish: r.currency_en,
    category: r.category || r.head_category_name_en || 'أدوية عامة',
    shapeArabic: r.shape_ar,
    shapeEnglish: r.shape_en,
    imageUrl: resolveImageUrl(req, r),
    activeIngredients: r.active_ingredients || r.scientific_name,
    manufacturer: r.manufacturer || '',
    scientificName: r.scientific_name || '',
    drugClass: r.drug_class || '',
    isAvailable: true,
    stripsCount: r.strips_count,
    packagingType: r.packaging_type,
  };
}

module.exports = { resolveImageUrl, formatMedicineRow };