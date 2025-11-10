// routes/stokOpnameRoutes.js
import express from "express";
import { createStokOpnameController, getStokOpname, fetchStokOpnameById, getEDListByBarang, getNoBatchListByBarangAndEd } from "../controllers/stokOpnameController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/stok-opname
router.post("/stok-opname", verifyToken, createStokOpnameController);
router.get("/stok-opname", verifyToken, getStokOpname);
router.get("/stok-opname/:id", verifyToken, fetchStokOpnameById);
router.get("/barang/:id/eds", getEDListByBarang);
router.get("/barang/:id/nobatch", getNoBatchListByBarangAndEd);

export default router;
