import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import streamifier from 'streamifier';
import {cloudinary} from "../config/cloudinary.js";

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

export const addPatientAttachment = async (req, res) => {
  const patientId = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Upload to Cloudinary as raw, keep original filename & extension
    const result = await new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'hospital/attachments',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: false,
      format: 'pdf' // try to force pdf
    },
    (error, result) => {
      if (result) resolve(result);
      else reject(error);
    }
  );
  streamifier.createReadStream(file.buffer).pipe(uploadStream);
});

// Save metadata
const [rows] = await pool.query(
  'INSERT INTO patient_attachments (patient_id, file_path, public_id, file_name, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
  [patientId, result.secure_url, result.public_id, file.originalname]
);


    res.json({
      message: 'Attachment uploaded successfully',
      attachment_id: rows.insertId,
      file_url: result.secure_url, // this now ends with .pdf if original filename had it
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getPatientAttachments = async (req, res) => {
  const patientId = req.params.id;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM patient_attachments WHERE patient_id = ? ORDER BY uploaded_at DESC',
      [patientId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Serve the attachment file to client
export const getFile = async (req, res) => {
  const attachmentId = req.params.attachmentId;
  try {
    const [rows] = await pool.query(
      'SELECT file_path FROM patient_attachments WHERE attachment_id = ?',
      [attachmentId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    // This just sends a JSON object with the URL
    res.json({ url: rows[0].file_path });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePatientAttachmentByPatient = async (req, res) => {
  const { id: patientId, attachmentId } = req.params;

  try {
    // Get the attachment details including public_id for Cloudinary deletion
    const [rows] = await pool.query(
      'SELECT public_id FROM patient_attachments WHERE attachment_id = ? AND patient_id = ?',
      [attachmentId, patientId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Attachment not found for this patient' });
    }

    const { public_id } = rows[0];

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(public_id);
      console.log(`File deleted from Cloudinary: ${public_id}`);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    const [deleteResult] = await pool.query(
      'DELETE FROM patient_attachments WHERE attachment_id = ? AND patient_id = ?',
      [attachmentId, patientId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Attachment not found for this patient' });
    }

    res.json({ 
      message: 'Attachment deleted successfully',
      attachment_id: attachmentId,
      patient_id: patientId
    });

  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
