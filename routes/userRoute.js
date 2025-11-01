import express from "express";
import { getAllUsers, getProfile } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/profile", verifyToken, getProfile);

export default router;
