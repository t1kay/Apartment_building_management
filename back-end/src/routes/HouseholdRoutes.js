import express from 'express';
import * as householdController from '../controllers/HouseholdController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Tất cả các routes liên quan đến hộ dân đều yêu cầu đăng nhập
router.use(verifyToken);

router.get('/get-all-households', householdController.getAllHouseholds);
router.get('/get-household-by-id/:id', householdController.getHouseholdById);
router.post('/create-household', householdController.createHousehold);
router.put('/update-household/:id', householdController.updateHousehold);
router.delete('/delete-household/:id', householdController.deleteHousehold);
router.post('/find-household-by-room-number', householdController.findHouseholdByRoomNumber);

export default router;