import express from "express";
import { getMenusByRole, getAllRolePrivileges } from "../controllers/menuController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getMenusByRole);
router.get("/privileges", verifyToken, getAllRolePrivileges);

export default router;
