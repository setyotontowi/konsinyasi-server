import express from "express";
import { getAllUsers, getProfile } from "../controllers/userController.js";
import { getAllUserGroups } from "../controllers/userGroupController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/profile", verifyToken, getProfile);
router.get("/group", verifyToken, getAllUserGroups);

export default router;
