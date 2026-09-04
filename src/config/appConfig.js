const path = require('path');
require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  DB_PATH: path.resolve(__dirname, '..', '..', 'database.sqlite'),
  IMAGES_DIR: path.resolve(__dirname, '..', '..', 'uploads', 'images'),
};

module.exports = config;