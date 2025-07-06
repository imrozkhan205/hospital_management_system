import pool from "../config/db.js"
export const getDashboardStats = async(req, res) => {
    try {
        const [[doctorCount]] = await pool.query(`SELECT COUNT(*) AS total_doctors FROM doctors`);
        const [[patientCount]] = await pool.query(`SELECT COUNT(*) AS total_patients FROM patients`);
        const [[appointmentCount]] = await pool.query(`SELECT COUNT(*) AS total_appointments FROM appointments`);
        const [[upcomingCount]] = await pool.query(`SELECT COUNT(*) AS upcoming_appointments FROM appointments WHERE appointment_date >= CURDATE()`);
        
        res.json({
            total_doctors: doctorCount.total_doctors,
            total_patients: patientCount.total_patients,
            total_appointments: appointmentCount.total_appointments,
            upcoming_appointments: upcomingCount.upcoming_appointments
        })
    } catch (error) {
        res.status(500).json({message:"Error fetching dashboard stats", error: error.message});
    }
} 