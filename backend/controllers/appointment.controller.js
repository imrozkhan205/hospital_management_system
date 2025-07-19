import pool from "../config/db.js";

export const createAppointment = async(req, res) => {
    const {
        appointment_id,
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        duration_minutes,
        appointment_type,
        status,
        reason_for_visit,
        notes,
    } = req.body;

    try {
        // Insert the appointment
        const [result] = await pool.query(
            `INSERT INTO appointments
            (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, reason_for_visit, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                appointment_id,
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                duration_minutes,
                appointment_type,
                status,
                reason_for_visit,
                notes
            ]
        );

        // ✅ Create notifications based on role
        const role = req.user.role; // comes from your verifyToken middleware

        if (role === 'admin') {
            // Admin created the appointment → notify doctor & patient
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES (?, ?), (?, ?)`,
                [
                    doctor_id, `A new appointment has been scheduled for you on ${appointment_date}`,
                    patient_id, `Your appointment has been scheduled on ${appointment_date}`
                ]
            );
        } else if (role === 'doctor') {
            // Doctor created → notify patient & admin
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES (?, ?), (?, ?)`,
                [
                    patient_id, `A new appointment has been created by your doctor on ${appointment_date}`,
                    1, `Doctor ID ${doctor_id} created a new appointment`  // assuming admin user_id = 1
                ]
            );
        } else if (role === 'patient') {
            // Patient created → notify doctor & admin
            await pool.query(
                `INSERT INTO notifications (user_id, message) VALUES (?, ?), (?, ?)`,
                [
                    doctor_id, `A new appointment has been requested by patient ID ${patient_id} on ${appointment_date}`,
                    1, `Patient ID ${patient_id} created a new appointment`
                ]
            );
        }

        res.status(201).json({
            message: "Appointment created successfully",
            appointment_id: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error in creating Appointment',
            error: error.message
        });
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

export const getAppointmentsByDoctorId = async (req, res) => {
  const doctor_id = req.params.doctor_id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC",
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching appointments", error: err.message });
  }
};

// PUT /appointments/:id/status
export const changeStatus = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;

  // Normalize status to lowercase
  status = status.toLowerCase();

  if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const [result] = await pool.query(
      'UPDATE appointments SET status = ? WHERE appointment_id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};


// Get booked slots for a selected date
export const getAppointmentsByDate = async (req, res) => {
  const { date, doctorId } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    let query = `SELECT appointment_time FROM appointments WHERE appointment_date = ?`;
    const params = [date];
    
    if (doctorId) {
      query += ` AND doctor_id = ?`;
      params.push(doctorId);
    }

    const [rows] = await pool.query(
  `SELECT TIME_FORMAT(appointment_time, '%H:%i') as appointment_time 
   FROM appointments 
   WHERE doctor_id = ? AND appointment_date = ?`,
  [doctorId, date]
);
const bookedSlots = rows.map(r => r.appointment_time); // already '11:00'


    
    res.json({ bookedSlots });
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Book a new appointment (simple)
export const createAppointmentSimple = async (req, res) => {
  const { date, time, doctor_id } = req.body;
  // get patient ID from logged in user (assuming you saved it in token & added to req.user)
  const patient_id = req.user?.linked_patient_id;

  if (!date || !time) {
    return res.status(400).json({ message: 'Date and time are required' });
  }

  try {
    // check if slot already booked
// check if the patient already has an appointment with the same doctor on the same day
const [existing] = await pool.query(
  `SELECT * FROM appointments 
   WHERE patient_id = ? AND doctor_id = ? AND appointment_date = ?`,
  [patient_id, doctor_id, date]
);

if (existing.length > 0) {
  return res.status(409).json({
    message: "You already have an appointment with this doctor on this date"
  });
}

// check if this specific time slot is already booked for the same doctor
const [slotBooked] = await pool.query(
  `SELECT * FROM appointments 
   WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?`,
  [doctor_id, date, time]
);

if (slotBooked.length > 0) {
  return res.status(409).json({ message: 'This time slot is already booked' });
}

// insert appointment
const [result] = await pool.query(
  `INSERT INTO appointments (appointment_date, appointment_time, patient_id, doctor_id, status)
   VALUES (?, ?, ?, ?, ?)`,
  [date, time, patient_id, doctor_id, 'Scheduled']
);

res.status(201).json({
  message: 'Appointment booked successfully',
  appointment_id: result.insertId
});

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/appointments.controller.js
export const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ message: 'doctorId and date are required' });
  }

  try {
    console.log('doctorId:', doctorId, 'date:', date);

    const [rows] = await pool.query(
      `SELECT appointment_time FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ?`,
      [doctorId, date]
    );

    console.log('Raw rows:', rows);

    const bookedSlots = rows.map(r => {
      const t = String(r.appointment_time);  // e.g. "14:00:00"
      return t.split(':').slice(0,2).join(':'); // → "14:00"
    });

    console.log('Booked slots:', bookedSlots);

    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const availableSlots = allSlots.filter(time => !bookedSlots.includes(time));

    res.json({
      bookedSlots,
      availableSlots,
      allSlots
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/appointments.controller.js
export const getAppointmentsByDoctorAndDate = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT appointment_time, appointment_date, status 
       FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ?`,
      [doctorId, date]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching appointments by doctor and date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
