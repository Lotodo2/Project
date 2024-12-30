const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// Admin Registration
exports.registerAdmin = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;

  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO admin (first_name, last_name, email, phone, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(query, [first_name, last_name, email, phone, hashedPassword]);

    res.status(200).json({ success: true, message: "Admin registered successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }
    console.error("Error during admin registration:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [result] = await pool.query("SELECT * FROM admin WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const admin = result[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    req.session.adminId = admin.id;
    req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ success: false, message: "Failed to log in." });
        }
        res.status(200).json({ success: true, message: "Login successful." });
      });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Add Fuel/Electric Station
exports.addStation = async (req, res) => {
    const {
      station_name, location, latitude, longitude, services,
      fuel_types, contact_number, opening_hours, amenities,
      station_manager, website, rating, station_type,
    } = req.body;
  
    if (!station_name || !location || !latitude || !longitude || !station_type) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }
  
    try {
      const tableName = station_type === "electric" ? "electric" : "fuel";
      const query = `
        INSERT INTO ${tableName} (
          station_name, location, latitude, longitude, services,
          fuel_types, contact_number, opening_hours, amenities,
          station_manager, website, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(query, [
        station_name, location, latitude, longitude, services || null,
        fuel_types || null, contact_number || null, opening_hours || null,
        amenities || null, station_manager || null, website || null, rating || null,
      ]);
  
      res.status(200).json({ success: true, message: `${station_type} station added successfully.` });
    } catch (error) {
      console.error("Error adding station:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  // Update Station
exports.updateStation = async (req, res) => {
    const { station_id, station_name, location, latitude, longitude, services, fuel_types, contact_number, opening_hours, amenities, station_manager, website, rating, station_type } = req.body;
  
    if (!station_id || !station_type) {
      return res.status(400).json({ success: false, message: "Station ID and type are required." });
    }
  
    try {
      const tableName = station_type === "electric" ? "electric" : "fuel";
      const query = `
        UPDATE ${tableName}
        SET station_name = ?, location = ?, latitude = ?, longitude = ?, services = ?, fuel_types = ?, contact_number = ?, opening_hours = ?, amenities = ?, station_manager = ?, website = ?, rating = ?
        WHERE station_id = ?
      `;
      await pool.query(query, [station_name, location, latitude, longitude, services, fuel_types, contact_number, opening_hours, amenities, station_manager, website, rating, station_id]);
      res.status(200).json({ success: true, message: "Station updated successfully." });
    } catch (error) {
      console.error("Error updating station:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  
  // Delete Station
  exports.deleteStation = async (req, res) => {
    const { station_id, station_type } = req.body;
  
    if (!station_id || !station_type) {
      return res.status(400).json({ success: false, message: "Station ID and type are required." });
    }
  
    try {
      const tableName = station_type === "electric" ? "electric" : "fuel";
      const query = `DELETE FROM ${tableName} WHERE station_id = ?`;
      await pool.query(query, [station_id]);
      res.status(200).json({ success: true, message: "Station deleted successfully." });
    } catch (error) {
      console.error("Error deleting station:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  // Fetch Station Details
exports.getStation = async (req, res) => {
    const { station_id, station_type } = req.query;
  
    if (!station_id || !station_type) {
      return res.status(400).json({ success: false, message: "Station ID and type are required." });
    }
  
    try {
      const tableName = station_type === "electric" ? "electric" : "fuel";
      const query = `SELECT  station_name, location, latitude, longitude, services, fuel_types,
      contact_number, opening_hours, amenities, station_manager, website, rating,
      last_inspection_date FROM ${tableName} WHERE station_id = ?`;
      const [result] = await pool.query(query, [station_id]);
  
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: "Station not found." });
      }
  
      res.status(200).json({ success: true, station: result[0] });
    } catch (error) {
      console.error("Error fetching station:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  