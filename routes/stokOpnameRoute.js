// routes/stokOpnameRoutes.js
import express from "express";
import { createStokOpnameController, getStokOpname } from "../controllers/stokOpnameController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/stok-opname
router.post("/stok-opname", verifyToken, createStokOpnameController);
router.get("/stok-opname", verifyToken, getStokOpname);

export default router;
