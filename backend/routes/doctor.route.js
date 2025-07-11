import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createDoctor, createDoctorWithUser, deleteDoctor, getDoctorAppointments, getDoctorPatients, getDoctors, getDoctorStats, updateDoctor } from '../controllers/doctor.controller.js';


const router = express.Router();
router.use(verifyToken)

router.get('/', getDoctors);
router.post('/', createDoctor)
router.delete('/:id', deleteDoctor)
router.put('/:id', updateDoctor)

router.get('/:doctorId/appointments', getDoctorAppointments);
router.get('/:doctorId/patients', getDoctorPatients);
router.post("/create-with-user", createDoctorWithUser);
router.get('/:doctorId/stats', getDoctorStats)


export default router;