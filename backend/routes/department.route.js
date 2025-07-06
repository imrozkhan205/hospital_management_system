import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createDepartment, deleteDepartment, getDepartments } from '../controllers/department.controller.js';

const router = express.Router()
router.use(verifyToken)

router.post('/', createDepartment)
router.get('/', getDepartments)
router.delete('/:id', deleteDepartment)

export default router