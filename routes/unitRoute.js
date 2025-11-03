import express from "express";
import { createUnit, getAllUnit, updateUserUnit, updateUnit, deleteUnit } from "../controllers/unitController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createUnit);
router.get("/", verifyToken, getAllUnit);
router.put("/change-unit", verifyToken, updateUserUnit);
router.put("/:id", verifyToken, updateUnit);
router.delete("/:id", verifyToken, deleteUnit);

export default router;
