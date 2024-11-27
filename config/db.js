const mysql = require('mysql2');
require('dotenv').config();
const nodemailer = require('nodemailer');
const pool = mysql.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections:true,
    connectionLimit: 10,
    queueLimit: 0
    }
);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

pool.query("SELECT 1", (err, results) => {
    if (err) {
      console.error("Database connection failed:", err);
    } else {
      console.log("Database connection successful!");
    }
  });
  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });
  

module.exports = pool.promise();