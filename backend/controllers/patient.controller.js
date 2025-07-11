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
    console.error(error);
    res.status(500).json({ message: "Error creating patient", error: error.message });
  }
};


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
    res.status(500).json({ message: 'Error fetching patients', error: err.message });
  }
};

export const deletePatient = async(req, res) => {
    const {id} = req.params;
    try{
        const [result] = await pool.query('DELETE FROM patients WHERE patient_id = ?', [id]);

        if (result.affectedRows === 0){
            return res.status(404).json({message: 'Patient not found'})
        }
        res.json({message: 'Patient deleted successfully'});
    }
    catch(err){
        res.status(500).json({message: 'Error deleting patient', error: err.message})
    }
}

export const updatePatient = async(req, res) => {
    const {id} = req.params;
    const{
        phone, email, address, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, allergies
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
            allergies = ?,
        WHERE patient_id = ?
            `,

            [
                phone, email, address, emergency_contact_name, emergency_contact_phone, insurance_provider, insurance_policy_number, allergies, id
            ]
        )

        if(result.affectedRows === 0){
            return res.status(404).json({message: 'Patient not found'})
        }
        res.json({message: 'Patient updated successfully'})
    } catch (error) {
        res.status(500).json({message: "Error updating patient", error: error.message})
    }
}

export const getPatientById = async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query("SELECT * FROM patients WHERE patient_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Patient not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching patient", error: err.message });
  }
};
