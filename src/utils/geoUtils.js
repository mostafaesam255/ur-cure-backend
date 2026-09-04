const PHARMACIES = [
  { id: 'seif', name: 'صيدلية سيف (المعادي)', lat: 29.9620, lng: 31.2510, phone: '19111', rating: 4.7 },
  { id: 'misr', name: 'صيدلية مصر (شارع 9)', lat: 29.9650, lng: 31.2530, phone: '19111', rating: 4.5 },
  { id: 'ali_ali', name: 'صيدلية علي وعلي (حدائق المعادي)', lat: 29.9710, lng: 31.2480, phone: '19999', rating: 4.3 },
  { id: 'nahdi', name: 'صيدلية النهدي (الأوتوستراد)', lat: 29.9480, lng: 31.2720, phone: '19222', rating: 4.6 }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = { PHARMACIES, calculateDistance };