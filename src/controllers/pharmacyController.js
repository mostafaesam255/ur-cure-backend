const { PHARMACIES, calculateDistance } = require('../utils/geoUtils');

// GET /api/pharmacies/nearest
function getNearestPharmacy(req, res) {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (isNaN(lat) || isNaN(lng)) {
    return res.json({ success: true, pharmacy: PHARMACIES[0] });
  }

  let nearest = null;
  let minDistance = Infinity;

  PHARMACIES.forEach(p => {
    const dist = calculateDistance(lat, lng, p.lat, p.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...p, distanceKm: parseFloat(dist.toFixed(2)) };
    }
  });

  res.json({ success: true, pharmacy: nearest });
}

module.exports = {
  getNearestPharmacy,
};