const express = require('express');
const router = express.Router();
const driverController = require('../controller/driverController');


  router.post('/register', driverController.registerDriver);
// Fetch stations route
router.get('/stations', driverController.getStations);
// Define your routes
router.post('/login', driverController.loginDriver);
router.get('/nearby-stations', driverController.getNearbyStations);

module.exports = router; // Export the router
