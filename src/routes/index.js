const express = require('express');
const router = express.Router();

const medicineRoutes = require('./medicineRoutes');
const chatRoutes = require('./chatRoutes');
const orderRoutes = require('./orderRoutes');
const pharmacyRoutes = require('./pharmacyRoutes');
const medicineController = require('../controllers/medicineController');

// Mount sub-routes
router.use('/medicines', medicineRoutes);
router.get('/categories', medicineController.getCategories);
router.use('/chat', chatRoutes);
router.use('/orders', orderRoutes);
router.use('/pharmacies', pharmacyRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

module.exports = router;