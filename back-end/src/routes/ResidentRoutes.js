import express from 'express';
import * as residentController from '../controllers/ResidentController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả các routes cư dân yêu cầu đăng nhập
router.use(verifyToken);

router.get('/get-all-residents', residentController.getAllResidents);
router.get('/get-resident-by-id/:id', residentController.getResidentById);
router.post('/create-resident', residentController.createResident);
router.put('/update-resident/:id', residentController.updateResident);
router.delete('/delete-resident/:id', residentController.deleteResident);

export default router;