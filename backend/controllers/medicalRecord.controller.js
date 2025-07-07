import pool from "../config/db.js";

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  const {
    patient_id,
    doctor_id,
    visit_date,
    diagnosis,
    treatment,
    prescription,
    lab_results,
    notes
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, visit_date, diagnosis,
        treatment, prescription, lab_results, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, doctor_id, visit_date, diagnosis, treatment, prescription, lab_results, notes]
    );

    res.status(201).json({
      message: "Medical record created",
      record_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating medical record", error: error.message });
  }
};

// Get all medical records
export const getMedicalRecords = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT mr.*, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
      FROM medical_records mr
      LEFT JOIN patients p ON mr.patient_id = p.patient_id
      LEFT JOIN doctors d ON mr.doctor_id = d.doctor_id
      ORDER BY mr.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching medical records", error: error.message });
  }
};

// Delete a medical record
export const deleteMedicalRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM medical_records WHERE record_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.json({ message: "Medical record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting medical record", error: error.message });
  }
};
