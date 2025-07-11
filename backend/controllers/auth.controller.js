import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Lookup user by username
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        linked_doctor_id: user.linked_doctor_id,
        linked_patient_id: user.linked_patient_id
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      linked_doctor_id: user.linked_doctor_id,
      linked_patient_id: user.linked_patient_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
