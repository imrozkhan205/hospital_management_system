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