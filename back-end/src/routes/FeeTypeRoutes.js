import express from 'express';
import * as feeTypeController from '../controllers/FeeTypeController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả các routes liên quan đến loại phí đều yêu cầu đăng nhập
router.use(verifyToken);

router.get('/get-all-fee-type', feeTypeController.getAllFeeTypes);
router.get('/get-fee-type-by-id/:id', feeTypeController.getFeeTypeById);

// Các hành động thay đổi biểu phí yêu cầu vai trò Tổ trưởng
router.post('/create-fee-type', requireRole(['Tổ trưởng']), feeTypeController.createFeeType);
router.put('/update-fee-type/:id', requireRole(['Tổ trưởng']), feeTypeController.updateFeeType);
router.delete('/delete-fee-type/:id', requireRole(['Tổ trưởng']), feeTypeController.deleteFeeType);

export default router;