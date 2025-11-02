import express from "express";
import { getAllUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { getAllUserGroups, updateUserGroup } from "../controllers/userGroupController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/profile", verifyToken, getProfile);
router.get("/group", verifyToken, getAllUserGroups);

router.put('/change-group', verifyToken, updateUserGroup);
router.put("/profile", verifyToken, updateProfile);

export default router;
