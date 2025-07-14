import express from 'express';
import { changeStatus, createAppointment, createAppointmentSimple, deleteAppointment, getAppointments, getAppointmentsByDate, getAppointmentsByDoctorId, getAvailableSlots, updateAppointment } from '../controllers/appointment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router()
router.use(verifyToken)

router.post('/', createAppointment)
router.get('/', getAppointments)
router.put('/:id', updateAppointment)
router.delete('/:id', deleteAppointment)
router.get("/doctor/:doctor_id", getAppointmentsByDoctorId);
router.put('/:id/status', changeStatus)
router.get('/', getAppointmentsByDate);
router.post('/simple', createAppointmentSimple)
router.get('/slots', getAvailableSlots)

// POST /api/appointments
router.post('/', createAppointmentSimple);

export default router;