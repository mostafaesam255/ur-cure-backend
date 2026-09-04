const sqlite3 = require('sqlite3').verbose();
const config = require('./appConfig');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${config.DB_PATH}`);
  }
});

module.exports = db;