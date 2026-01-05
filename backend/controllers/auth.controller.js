import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { username, password } = req.body;

  // Debug logging
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Username:', username);
  console.log('Password length:', password?.length);
  console.log('JWT_SECRET exists:', !!JWT_SECRET);
  console.log('DB pool exists:', !!pool);

  try {
    // Check if JWT_SECRET is set
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set!');
      return res.status(500).json({ 
        message: "Server configuration error: JWT_SECRET missing" 
      });
    }

    // Validate input
    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }

    // Test database connection first
    let connection;
    try {
      connection = await pool.getConnection();
      console.log('✅ Database connection successful');
    } catch (dbErr) {
      console.error('❌ Database connection failed:', dbErr.message);
      return res.status(500).json({ 
        message: "Database connection error",
        error: dbErr.message 
      });
    }

    // Lookup user by username
    let rows;
    try {
      [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?", 
        [username]
      );
      console.log('✅ Query executed. Rows found:', rows.length);
    } catch (queryErr) {
      console.error('❌ Query error:', queryErr.message);
      if (connection) connection.release();
      return res.status(500).json({ 
        message: "Database query error",
        error: queryErr.message 
      });
    } finally {
      if (connection) connection.release();
    }

    if (rows.length === 0) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ 
        message: "Invalid username or password" 
      });
    }

    const user = rows[0];
    console.log('User found:', {
      username: user.username,
      role: user.role,
      hasPassword: !!user.password
    });

    // Compare passwords
    let match;
    try {
      match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match);
    } catch (bcryptErr) {
      console.error('❌ Bcrypt error:', bcryptErr.message);
      return res.status(500).json({ 
        message: "Password verification error",
        error: bcryptErr.message 
      });
    }

    if (!match) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ 
        message: "Invalid username or password" 
      });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign({
        role: user.role,
        linked_doctor_id: user.linked_doctor_id,
        linked_patient_id: user.linked_patient_id
      }, JWT_SECRET, { expiresIn: "7d" });
      console.log('✅ Token generated successfully');
    } catch (jwtErr) {
      console.error('❌ JWT error:', jwtErr.message);
      return res.status(500).json({ 
        message: "Token generation error",
        error: jwtErr.message 
      });
    }

    console.log('✅ Login successful for user:', username);
    res.json({
      token,
      role: user.role,
      linked_doctor_id: user.linked_doctor_id,
      linked_patient_id: user.linked_patient_id
    });

  } catch (err) {
    console.error('❌ Unexpected error in login:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: "Login failed", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};