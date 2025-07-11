import bcrypt from 'bcrypt';
import pool from '../config/db.js';

export const createDoctorUser = async (req, res) => {
  const { username, password, doctor_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, password, role, linked_doctor_id)
       VALUES (?, ?, 'doctor', ?)`,
      [username, hashedPassword, doctor_id]
    );
    res.json({ message: "Doctor user created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating doctor user", error: err.message });
  }
};

export const createPatientUser = async (req, res) => {
  const { username, password, patient_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, password, role, linked_patient_id)
       VALUES (?, ?, 'patient', ?)`,
      [username, hashedPassword, patient_id]
    );
    res.json({ message: "Patient user created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating patient user", error: err.message });
  }
};
