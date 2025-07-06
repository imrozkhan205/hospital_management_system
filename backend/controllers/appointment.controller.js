import pool from "../config/db.js";

export const createAppointment = async(req, res) => {
    const {
    appointment_id  ,
    patient_id  ,
    doctor_id ,
    appointment_date  ,
    appointment_time  ,
    duration_minutes  ,
    appointment_type ,
    status ,
    reason_for_visit,
    notes ,
    } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO appointments
            (appointment_id  ,
    patient_id  ,
    doctor_id ,
    appointment_date  ,
    appointment_time  ,
    duration_minutes  ,
    appointment_type ,
    status ,
    reason_for_visit,
    notes )
    VALUES(?,?,?,?,?,?,?,?,?,?)
            `,
            [appointment_id  ,
    patient_id  ,
    doctor_id ,
    appointment_date  ,
    appointment_time  ,
    duration_minutes  ,
    appointment_type ,
    status ,
    reason_for_visit,
    notes]
        );
        res.status(201).json({message: "Appointment created successfully",
            appointment_id: result.insertId
        })

    } catch (error) {
        res.status(500).json({message: 'Error in creating Appointment', error: error.message});
    }
}

export const getAppointments = async(req, res) => {
    try {
        const [rows] = await pool.query('SELECT * from appointments');
        res.json(rows);
    } catch (error) {
        res.status(500).json({message: 'Error in fetching appointments',error: error.message});
    }    
}

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const {
    appointment_date,
    appointment_time,
    duration_minutes,
    appointment_type,
    status,
    reason_for_visit,
    notes
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE appointments SET
        appointment_date = ?,
        appointment_time = ?,
        duration_minutes = ?,
        appointment_type = ?,
        status = ?,
        reason_for_visit = ?,
        notes = ?
      WHERE appointment_id = ?`,
      [
        appointment_date,
        appointment_time,
        duration_minutes,
        appointment_type,
        status,
        reason_for_visit,
        notes,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM appointments WHERE appointment_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error: error.message });
  }
};