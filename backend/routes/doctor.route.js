import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createDoctor, deleteDoctor, getDoctors } from '../controllers/doctor.controller.js';


const router = express.Router();
router.use(verifyToken)

router.get('/', getDoctors);
router.post('/', createDoctor)
router.delete('/:id', deleteDoctor)

export default router;