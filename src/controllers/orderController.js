const db = require('../config/db');

// GET /api/orders
function getOrders(req, res) {
  const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
  db.all(sql, [], (err, orders) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: orders });
  });
}

// POST /api/orders
function createOrder(req, res) {
  const body = req.body;
  const orderId = body.orderId || `#${Math.floor(1000 + Math.random() * 9000)}`;

  const sql = `
    INSERT INTO orders (
      order_id, pharmacy_name, date, status, total_price, items_summary,
      is_emergency, is_ai_verified, patient_name, patient_phone,
      delivery_address, patient_latitude, patient_longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    orderId,
    body.pharmacyName || 'صيدلية العزبي',
    body.date || 'اليوم',
    body.status || 'received',
    body.totalPrice || 0.0,
    body.itemsSummary || 'طلب جديد',
    body.isEmergency ? 1 : 0,
    body.isAiVerified ? 1 : 0,
    body.patientName || 'مصطفى أحمد',
    body.patientPhone || '01123456789',
    body.deliveryAddress || 'عنوان المريض',
    body.patientLatitude || 29.9602,
    body.patientLongitude || 31.2569,
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, orderId: orderId });
  });
}

module.exports = {
  getOrders,
  createOrder,
};