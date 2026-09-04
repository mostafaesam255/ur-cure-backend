const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/appConfig');

if (!fs.existsSync(config.IMAGES_DIR)) {
  fs.mkdirSync(config.IMAGES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'chat-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;