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

  // Fix common spelling variations
  normalized = normalized
    .replace(/البنادول/g, 'البانادول')
    .replace(/بنادول/g, 'بانادول');

  // Strip definite article 'ال' from the beginning of words
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

module.exports = { normalizeArabic };