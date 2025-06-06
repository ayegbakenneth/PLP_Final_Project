const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

// MySQL connection
const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

module.exports = db;