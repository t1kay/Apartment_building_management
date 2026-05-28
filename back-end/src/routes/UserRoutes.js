import express from "express";
import * as userController from "../controllers/UserController.js";
import { verifyToken, requireRole, verifySelfOrRole } from "../middlewares/auth.js";

const router = express.Router();

// Route công khai
router.post('/login', userController.login);

// Routes yêu cầu xác thực và phân quyền
router.get("/get-all-user", verifyToken, requireRole(["Tổ trưởng"]), userController.getAllUsers);
router.post("/create-user", verifyToken, requireRole(["Tổ trưởng"]), userController.createUser);
router.delete("/delete-user/:id", verifyToken, requireRole(["Tổ trưởng"]), userController.deleteUser);

// Routes cho phép chính chủ hoặc Tổ trưởng
router.get("/get-user-by-id/:id", verifyToken, verifySelfOrRole(["Tổ trưởng"]), userController.getUserById);
router.put("/update-user/:id", verifyToken, verifySelfOrRole(["Tổ trưởng"]), userController.updateUser);

export default router;