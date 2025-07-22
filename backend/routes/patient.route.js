import express from 'express';
import { addPatientAttachment, createPatient, createPatientWithUser, deletePatient, deletePatientAttachmentByPatient, getAppointmentsByPatient, getFile, getPatientAttachments, getPatientById, getPatientDoctors, getPatientNotifications, getPatients, getPatientStats, updatePatient } from '../controllers/patient.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';


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
router.post('/:id/attachment', upload.single('file'), addPatientAttachment);
router.get('/:id/attachments', getPatientAttachments);
router.get('/attachment/:attachmentId', getFile);
router.delete('/:id/attachments/:attachmentId', deletePatientAttachmentByPatient);

// Delete attachment by patient

// NEW: Get patient notifications
router.get("/:id/notifications", getPatientNotifications);



export default router;