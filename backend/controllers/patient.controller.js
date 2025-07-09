import pool from "../config/db.js";


export const createPatient = async(req, res) => {
    const {
    patient_number,
    first_name ,
    last_name ,
    date_of_birth ,
    gender ,
    blood_type,
    phone ,
    email ,
    address,
    emergency_contact_name ,
    emergency_contact_phone ,
    insurance_provider ,
    insurance_policy_number ,
    allergies,
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO patients 
            (    patient_number,
    first_name ,
    last_name ,
    date_of_birth ,
    gender ,
    blood_type,
    phone ,
    email ,
    address,
    emergency_contact_name ,
    emergency_contact_phone ,
    insurance_provider ,
    insurance_policy_number,
    allergies
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
             patient_number,
        first_name,
        last_name,
        date_of_birth,
        gender,
        blood_type,
        phone,
        email,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        insurance_provider,
        insurance_policy_number,
        allergies
        ]
    );

    res.status(201).json({message: 'Patient created', patient_id: result.insertID });
    } catch (err) {
        res.status(500).json({message: 'Error creating patient', error: err.message})
    }
}

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