import express from 'express';
import { createPatient, createPatientWithUser, deletePatient, getAppointmentsByPatient, getPatientById, getPatientDoctors, getPatients, getPatientStats, updatePatient } from '../controllers/patient.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';


const router = express.Router();
router.use(verifyToken)

router.post('/', createPatient);
router.get('/', getPatients)
router.delete('/:id', deletePatient)
router.put('/:id', updatePatient)
router.get('/:id', getPatientById);
router.post('/create-with-user', createPatientWithUser)
router.get('/:patientId/appointments', getAppointmentsByPatient);
router.get('/:patientId/doctors', getPatientDoctors)
router.get('/:patientId/stats', getPatientStats)

export default router;