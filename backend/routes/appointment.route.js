import express from 'express';
import {
  changeStatus,
  createAppointment,
  createAppointmentSimple,
  deleteAppointment,
  getAppointments,
  getAppointmentsByDoctorAndDate,
  getAvailableSlots,
  updateAppointment
} from '../controllers/appointment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(verifyToken);

// All appointments (admin)
router.get('/', getAppointments);  

// Create appointment (admin or complex version)
router.post('/', createAppointment);

// Create simple appointment (patient self-book)
router.post('/simple', createAppointmentSimple);

// Update / Delete
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

// Change status
router.put('/:id/status', changeStatus);

// Get available slots for a doctor on a date
router.get('/slots', getAvailableSlots);

// Get appointments by doctor and date
router.get('/doctor/:doctorId', getAppointmentsByDoctorAndDate);

export default router;
