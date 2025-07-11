import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// Create patient with user login
export const createPatient = async (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    email,
    insurance_provider,
    username,
    password
  } = req.body;

  try {
    // 1. Add patient
    const [patientResult] = await pool.query(
      "INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, insurance_provider) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [first_name, last_name, date_of_birth, gender, phone, email, insurance_provider]
    );
    const patient_id = patientResult.insertId;

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password || 'patient123', 10);

    // 3. Add user
    await pool.query(
      "INSERT INTO users (username, password, role, linked_patient_id) VALUES (?, ?, 'patient', ?)",
      [username, hashedPassword, patient_id]
    );

    res.status(201).json({ message: "Patient created with login" });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ message: "Error creating patient", error: error.message });
  }
};

// Get all patients (with latest diagnosis)
export const getPatients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        (
          SELECT mr.diagnosis 
          FROM medical_records mr 
          WHERE mr.patient_id = p.patient_id 
          ORDER BY mr.visit_date DESC 
          LIMIT 1
        ) AS latest_diagnosis
      FROM patients p
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: 'Error fetching patients', error: err.message });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM patients WHERE patient_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ message: 'Error deleting patient', error: err.message });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const {
    phone, email, address, emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number, allergies
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE patients SET
        phone = ?,
        email = ?,
        address = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        insurance_provider = ?,
        insurance_policy_number = ?,
        allergies = ?
      WHERE patient_id = ?`,
      [
        phone, email, address, emergency_contact_name, emergency_contact_phone,
        insurance_provider, insurance_policy_number, allergies, id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ message: "Error updating patient", error: error.message });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM patients WHERE patient_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Patient not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ message: "Error fetching patient", error: err.message });
  }
};

// Create patient + user together
export const createPatientWithUser = async (req, res) => {
  const {
    username, password, first_name, last_name,
    date_of_birth, gender, phone, email, insurance_provider
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [patientResult] = await pool.query(
      "INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, insurance_provider) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [first_name, last_name, date_of_birth, gender, phone, email, insurance_provider]
    );
    const newPatientId = patientResult.insertId;

    await pool.query(
      "INSERT INTO users (username, password, role, linked_patient_id) VALUES (?, ?, 'patient', ?)",
      [username, hashedPassword, newPatientId]
    );

    res.status(201).json({ message: "Patient(user) created successfully", patient_id: newPatientId });
  } catch (error) {
    console.error("Error creating patient(user):", error);
    res.status(500).json({ message: "Failed to create patient(user)", error: error.message });
  }
};

// Get all appointments by patient
export const getAppointmentsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM appointments WHERE patient_id = ?",
      [patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching appointments by patient:", err);
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
};

export const getPatientDoctors = async (req, res) => {
  const { patientId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT d.*
      FROM doctors d
      JOIN appointments a ON d.doctor_id = a.doctor_id
      WHERE a.patient_id = ?
    `, [patientId]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};


// patient.controller.js

export const getPatientStats = async (req, res) => {
  const { patientId } = req.params;
  try {
    // Total appointments & by status
    const [apptStats] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM appointments 
       WHERE patient_id = ? 
       GROUP BY status`, [patientId]
    );

    // Appointments by type
    const [typeStats] = await pool.query(
      `SELECT appointment_type, COUNT(*) as count 
       FROM appointments 
       WHERE patient_id = ? 
       GROUP BY appointment_type`, [patientId]
    );

    // Appointments over last months (e.g., last 6 months)
    const [monthlyStats] = await pool.query(`
      SELECT DATE_FORMAT(appointment_date, '%Y-%m') as month, COUNT(*) as count
      FROM appointments 
      WHERE patient_id = ?
      GROUP BY month
      ORDER BY month
    `, [patientId]);

    // Number of unique doctors seen
    const [doctorsSeen] = await pool.query(`
      SELECT COUNT(DISTINCT doctor_id) as total_doctors
      FROM appointments 
      WHERE patient_id = ?
    `, [patientId]);

    res.json({
      apptStats,
      typeStats,
      monthlyStats,
      totalDoctors: doctorsSeen[0].total_doctors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch patient stats", error: err.message });
  }
};
