const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

// Register route
router.post('/register', adminController.registerAdmin);

// Login route
router.post('/login', adminController.loginAdmin);

// Add station route
router.post('/add-station', adminController.addStation);


  // Dashboard Route
router.get("/dashboard", (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).send("Unauthorized. Please log in.");
    }
    res.sendFile("index.html", { root: __dirname + "/../" });
  });
  
  router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to log out.");
      }
      res.clearCookie('user_sid'); // Clear session cookie
      res.status(200).send("Logged out successfully.");
    });
  });
  router.get('/check-session', (req, res) => {
    if (req.session.adminId) {
      return res.status(200).json({ loggedIn: true });
    }
    res.status(200).json({ loggedIn: false });
  });
  
  // Update station route
router.put('/update-station', adminController.updateStation);

// Delete station route
router.delete('/delete-station', adminController.deleteStation);
// Fetch station details route
router.get('/get-station', adminController.getStation);

module.exports = router;
