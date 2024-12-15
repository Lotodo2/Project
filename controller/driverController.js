const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { createPool } = require("mysql2");


// Register Driver
exports.registerDriver = async (req, res) => {
  const {
    first_name, last_name, email, phone,
    license_number, vehicle_type, vehicle_registration, password,
  } = req.body;

  if (!first_name || !last_name || !email || !phone || !license_number || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO driver
      (first_name, last_name, email, phone, license_number, vehicle_type, vehicle_registration, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      first_name, last_name, email, phone,
      license_number, vehicle_type || null,
      vehicle_registration || null, hashedPassword,
    ]);

    console.log("Driver registered successfully:", { first_name, last_name, email });
    res.status(200).json({ success: true, message: "Registration successful!Please Login" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.error("Duplicate entry error:", err);
      return res.status(400).json({ success: false, message: "Email or license number already exists." });
    }
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Driver Login
exports.loginDriver = async (req, res) => {
    console.log("Request Body:", req.body);
    // Extract email and password from the request body
    const { email, password } = req.body; 
  
    // Log the email and password to ensure they are received correctly
    console.log("Login attempt with email:", email, "and password:", password);
  
    try {
      // Query the database for a driver with the given email
      const [result] = await pool.query('SELECT * FROM driver WHERE email = ?', [email]);
  
      // Log the query result
      console.log("Query result:", result);
  
      // If no driver is found, return an error
      if (result.length === 0) {
        console.log("No user found for email:", email);
        return res.status(401).send('Invalid email or password.');
      }
  
      const user = result[0]; // Extract the driver details
  
      // Log the hashed password stored in the database
      console.log("Stored hashed password:", user.password);
  
      // Compare the entered password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Password match:", passwordMatch);
  
      // If the password doesn't match, return an error
      if (!passwordMatch) {
        console.log("Password mismatch for email:", email);
        return res.status(401).send('Invalid email or password.');
      }
  
      // Store the driver ID in the session
      req.session.driverId = user.id;
      console.log("Login successful for driver ID:", user.id);
  
      // Send a success response
      res.status(200).json({ success: true, message: 'Login successful!' });
    } catch (error) {
      console.error('Error logging in driver:', error);
      res.status(500).send('Error logging in driver.');
    }
  };
  // Fetch stations handler
  exports.getStations = async (req, res) => {
    console.log("Session data:", req.session);
  
    // Validate session
    if (!req.session.driverId) {
      console.log("Unauthorized: Driver ID missing from session.");
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  
    const { type } = req.query;
  
    try {
      const tableName = type === 'electric' ? 'electric' : 'fuel';
      const [stations] = await pool.query(`SELECT * FROM ${tableName}`);
      res.json({ success: true, stations });
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  // Fetch Nearby Stations
  exports.getNearbyStations = async (req, res) => {
    const { latitude, longitude, station_type, radius = 50 } = req.query;
     console.log('Nearby stations request:', { latitude, longitude, station_type, radius });
     if (!req.session.driverId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }  
    try {
      const tableName = station_type === 'electric' ? 'electric' : 'fuel';
      console.log('Station type received:', station_type);
      const query = `
        SELECT *, 
          (6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(latitude)) *
            COS(RADIANS(longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(latitude))
          )) AS distance
        FROM ${tableName}
        HAVING distance < ?
        ORDER BY distance;
      `;
      console.log('Nearby stations request:', { latitude, longitude, radius });

      const [results] = await pool.query(query, [latitude, longitude, latitude, radius]);
      console.log('Nearby stations query results:', results);
      console.log('Query executed with params:', { latitude, longitude, radius });
      if (results.length === 0) {
        console.log('No stations found within the specified radius.');
      }
      res.status(200).json({ success: true, stations: results });
    } catch (error) {
      console.error  ('Error fetching stations:', error);
      res.status(500).send('Failed to fetch stations.');
    }
  };