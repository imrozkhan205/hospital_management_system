import pool from "../config/db.js";
import bcrypt from "bcryptjs";
export const getDoctors = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    specialization,
    experience_years,
    username,
    password
  } = req.body;

  try {
    // 1. Add doctor
    const [doctorResult] = await pool.query(
      "INSERT INTO doctors (first_name, last_name, email, phone, specialization, experience_years) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone, specialization, experience_years]
    );
    const doctor_id = doctorResult.insertId;

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password || 'doctor123', 10);

    // 3. Add user
    await pool.query(
      "INSERT INTO users (username, password, role, linked_doctor_id) VALUES (?, ?, 'doctor', ?)",
      [username, hashedPassword, doctor_id]
    );

    res.status(201).json({ message: "Doctor created with login" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating doctor", error: error.message });
  }
};



export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM doctors WHERE doctor_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting doctor", error: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    phone,
    email,
    specialization,
    license_number,
    department_id,
    consultation_fee,
    experience_years,
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE doctors SET 
        phone = ?,
        email = ?,
        specialization = ?,
        license_number = ?,
        department_id = ?,
        consultation_fee = ?,
        experience_years = ?
      WHERE doctor_id = ?`,
      [
        phone,
        email,
        specialization,
        license_number,
        department_id,
        consultation_fee,
        experience_years,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor", error: error.message });
  }
};

// controllers/doctor.controller.js

// controllers/doctor.controller.js
export const getDoctorAppointments = async (req, res) => {
  const doctorId = req.params.doctorId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM appointments WHERE doctor_id = ?",
      [doctorId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get appointments" });
  }
};


export const getDoctorPatients = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT p.* 
       FROM patients p
       JOIN appointments a ON p.patient_id = a.patient_id
       WHERE a.doctor_id = ?`,
      [doctorId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching patients" });
  }
};


// POST /api/doctors/create-with-user
export const createDoctorWithUser = async (req, res) => {
  const { username, password, first_name, last_name, email, phone, specialization, license_number, department_id } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert doctor
    const [doctorResult] = await pool.query(
      "INSERT INTO doctors (first_name, last_name, email, phone, specialization, license_number, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone, specialization, license_number, department_id]
    );
    const newDoctorId = doctorResult.insertId;

    // Insert user linked to doctor
    await pool.query(
      "INSERT INTO users (username, password, role, linked_doctor_id) VALUES (?, ?, 'doctor', ?)",
      [username, hashedPassword, newDoctorId]
    );

    res.status(201).json({ message: "Doctor(user) created successfully", doctor_id: newDoctorId });
  } catch (err) {
    console.error("Error creating doctor and user:", err);
    res.status(500).json({ message: "Failed to create doctor and user", error: err.message });
  }
};


// doctor.controller.js
export const getDoctorStats = async (req, res) => {
  const { doctorId } = req.params;
  try {
    // Appointments by status
    const [apptStats] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM appointments 
       WHERE doctor_id = ? 
       GROUP BY status`, [doctorId]
    );

    // Appointments by type
    const [typeStats] = await pool.query(
      `SELECT appointment_type, COUNT(*) as count 
       FROM appointments 
       WHERE doctor_id = ? 
       GROUP BY appointment_type`, [doctorId]
    );

    // Appointments over last months
    const [monthlyStats] = await pool.query(`
      SELECT DATE_FORMAT(appointment_date, '%Y-%m') as month, COUNT(*) as count
      FROM appointments 
      WHERE doctor_id = ?
      GROUP BY month
      ORDER BY month
    `, [doctorId]);

    // Number of unique patients seen
    const [patientsSeen] = await pool.query(`
      SELECT COUNT(DISTINCT patient_id) as total_patients
      FROM appointments 
      WHERE doctor_id = ?
    `, [doctorId]);

    res.json({
      apptStats,
      typeStats,
      monthlyStats,
      totalPatients: patientsSeen[0].total_patients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch doctor stats", error: err.message });
  }
};
