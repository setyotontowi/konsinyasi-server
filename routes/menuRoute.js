import express from "express";
import { getMenusByRole, getAllRolePrivileges, getAllMenus } from "../controllers/menuController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getMenusByRole);
router.get("/privileges", verifyToken, getAllRolePrivileges);
router.get("/all", verifyToken, getAllMenus );

export default router;
