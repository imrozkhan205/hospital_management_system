import express from 'express';
import { createAppointment } from '../controllers/appointment.controller.js';

const router = express.Router()

router.post('/', createAppointment)

export default router;