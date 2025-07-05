import express from 'express';
import { createPatient, deletePatient, getPatients, updatePatient } from '../controllers/patient.controller.js';


const router = express.Router();
router.post('/', createPatient);
router.get('/', getPatients)
router.delete('/:id', deletePatient)
router.put('/:id', updatePatient)
export default router;