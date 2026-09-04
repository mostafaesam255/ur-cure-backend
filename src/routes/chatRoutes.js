const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const upload = require('../middlewares/upload');

router.post('/', chatController.handleChat);
router.post('/upload', upload.single('image'), chatController.uploadChatImage);
router.post('/scan-box', upload.single('image'), chatController.scanMedicineBox);

module.exports = router;