// routes/stokOpnameRoutes.js
import express from "express";
import { 
    createStokOpnameController, 
    getStokOpname, 
    fetchStokOpnameById, 
    getEDListByBarang, 
    getNoBatchListByBarangAndEd,
    checkStock, 
    updateStokOpnameController
} from "../controllers/stokOpnameController.js";
import { getHistoryStok, getAllStok } from "../controllers/stokController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/stok-opname
router.post("/stok-opname", verifyToken, createStokOpnameController);
router.get("/stok-opname", verifyToken, getStokOpname);
router.get("/stok-opname/:id", verifyToken, fetchStokOpnameById);
router.put("/stok-opname/:id", verifyToken, updateStokOpnameController);
router.get("/barang/:id/eds", getEDListByBarang);
router.get("/barang/:id/nobatch", getNoBatchListByBarangAndEd);
router.post("/check-stock", checkStock);
router.get("/get-all-stok", verifyToken, getAllStok);

router.get("/journal", verifyToken, getHistoryStok);


export default router;
