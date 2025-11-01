import express from "express";
import { getAllUnit, updateUserUnit } from "../controllers/unitController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUnit);
router.put("/change-unit", verifyToken, updateUserUnit);

export default router;
