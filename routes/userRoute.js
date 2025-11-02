import express from "express";
import { getAllUsers, getProfile, updateProfile, deleteUser } from "../controllers/userController.js";
import { getAllUserGroups, updateUserGroup } from "../controllers/userGroupController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/profile", verifyToken, getProfile);
router.get("/group", verifyToken, getAllUserGroups);

router.put('/change-group', verifyToken, updateUserGroup);
router.put("/profile", verifyToken, updateProfile);
router.put("/:id", verifyToken, updateProfile);
router.delete("/:id", verifyToken, deleteUser);

export default router;
