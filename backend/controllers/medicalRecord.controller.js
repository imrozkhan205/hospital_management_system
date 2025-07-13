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
    const [results] = await pool.query(`
      SELECT 
        medical_records.*,
        patients.first_name as patient_first_name,
        patients.last_name as patient_last_name,
        doctors.first_name as doctor_first_name,
        doctors.last_name as doctor_last_name
      FROM medical_records
      JOIN patients ON medical_records.patient_id = patients.patient_id
      JOIN doctors ON medical_records.doctor_id = doctors.doctor_id
      ORDER BY medical_records.visit_date DESC
    `);
    
    res.json(results);
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
