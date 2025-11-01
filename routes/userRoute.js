import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/users", verifyToken, getAllUsers);

export default router;
