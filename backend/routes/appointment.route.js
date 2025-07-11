import express from 'express';
import { createAppointment, deleteAppointment, getAppointments, getAppointmentsByDoctorId, updateAppointment } from '../controllers/appointment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router()
router.use(verifyToken)

router.post('/', createAppointment)
router.get('/', getAppointments)
router.put('/:id', updateAppointment)
router.delete('/:id', deleteAppointment)
router.get("/doctor/:doctor_id", getAppointmentsByDoctorId);

export default router;