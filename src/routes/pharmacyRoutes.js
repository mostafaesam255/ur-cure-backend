const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

router.get('/nearest', pharmacyController.getNearestPharmacy);

module.exports = router;