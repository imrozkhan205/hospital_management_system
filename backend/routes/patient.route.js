import express from 'express';
import { createPatient, deletePatient, getPatients, updatePatient } from '../controllers/patient.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';


const router = express.Router();
router.use(verifyToken)

router.post('/', createPatient);
router.get('/', getPatients)
router.delete('/:id', deletePatient)
router.put('/:id', updatePatient)
export default router;