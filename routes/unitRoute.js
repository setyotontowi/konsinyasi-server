import express from "express";
import { getAllUnit } from "../controllers/unitController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUnit);

export default router;
