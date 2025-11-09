// routes/stokOpnameRoutes.js
import express from "express";
import { createStokOpnameController } from "../controllers/stokOpnameController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/stok-opname
router.post("/", verifyToken, createStokOpnameController);

export default router;
