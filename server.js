const express = require('express');
const cors = require('cors');
const config = require('./src/config/appConfig');
const requestLogger = require('./src/middlewares/logger');
const routes = require('./src/routes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Static route for local product images
app.use('/images', express.static(config.IMAGES_DIR));

// API Routes
app.use('/api', routes);

// Static route for Flutter Web App
const path = require('path');
const fs = require('fs');
const localPublicDir = path.resolve(__dirname, 'public');
const localFlutterWebDir = path.resolve(__dirname, '..', 'ur_cure_flutter', 'build', 'web');
const WEB_DIR = fs.existsSync(localPublicDir) ? localPublicDir : (fs.existsSync(localFlutterWebDir) ? localFlutterWebDir : null);

if (WEB_DIR) {
  app.use(express.static(WEB_DIR));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/images')) return next();
    res.sendFile(path.join(WEB_DIR, 'index.html'));
  });
}

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(config.PORT, () => {
  console.log(`===================================================`);
  console.log(`Ur Cure Backend API Server listening on port ${config.PORT}`);
  console.log(`API Base URL: http://localhost:${config.PORT}/api`);
  console.log(`Images Base URL: http://localhost:${config.PORT}/images/`);
  console.log(`===================================================`);
});

module.exports = app;