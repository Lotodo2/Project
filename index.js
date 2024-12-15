const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");
require("dotenv").config();
const pool = require("./config/db");
const nodemailer = require('nodemailer');

const driverRoutes = require("./routes/driverRoutes");
const app = express();

const bodyParser = require("body-parser");
// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Debugging middleware for request body
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
  if (req.method === "POST") {
    console.log("Request body:", req.body); // Log request body
  }
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
// Set up session store with MySQL
app.use(
  session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({}, pool),
    cookie: { secure: false, maxAge: 3600000 }, // cookie lasts for 1 hour
  })
);

// Use routes
app.use("/driver", driverRoutes);


app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// Serve HTML for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/stations', (req, res) => {
  const { serviceType } = req.query;
  if (!serviceType) {
      return res.status(400).json({ success: false, message: "Missing service type." });
  }
  // Dummy data for testing
  const stations = [
      { id: 1, name: "Station 1", type: "fuel" },
      { id: 2, name: "Station 2", type: "electric" },
  ];
  res.json({ success: true, stations });
});


app.get('/terms-and-conditions', (req, res) => {
  res.sendFile(__dirname + '/terms-and-conditions.html');
});
// Route for Privacy Policy
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Route for FAQ
app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'faq.html'));
});

// Route for New EV Stations in Nairobi
app.get('/news/new-ev-stations', (req, res) => {
  res.sendFile(path.join(__dirname, '/new-ev-stations.html'));
});

// Route for Discounted Fuel Rates
app.get('/news/discounted-rates', (req, res) => {
  res.sendFile(path.join(__dirname, '/discounted-rates.html'));
});

// Start server
const port = process.env.PORT || 3300;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
