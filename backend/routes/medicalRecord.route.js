import express from "express";
import {
  createMedicalRecord,
  getMedicalRecords,
  deleteMedicalRecord
} from "../controllers/medicalRecord.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.use(verifyToken);

router.post("/", createMedicalRecord);
router.get("/", getMedicalRecords);
router.delete("/:id", deleteMedicalRecord);

export default router;
