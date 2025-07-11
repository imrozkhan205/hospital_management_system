import express from 'express';
import { createDoctorUser, createPatientUser } from '../controllers/user.controller.js';

const router = express.Router();

// These routes should be protected so only admin can call them
router.post('/create-doctor-user', createDoctorUser);
router.post('/create-patient-user', createPatientUser);

export default router;
