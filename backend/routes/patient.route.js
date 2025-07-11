import express from 'express';
import { createPatient, deletePatient, getPatientById, getPatients, updatePatient } from '../controllers/patient.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';


const router = express.Router();
router.use(verifyToken)

router.post('/', createPatient);
router.get('/', getPatients)
router.delete('/:id', deletePatient)
router.put('/:id', updatePatient)
router.get('/:id', getPatientById);
export default router;