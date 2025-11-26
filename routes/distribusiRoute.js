import express from "express";
import * as Controller from "../controllers/permintaanDistribusiController.js";
import * as DistribusiController from "../controllers/distribusiController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * BASE PATH: /permintaan
 * All routes are protected by JWT (verifyToken)
 */

// ✅ List all permintaan distribusi (with filters & pagination)
router.get("/permintaan", verifyToken, Controller.getAllPermintaanDistribusi);

// ✅ Get single permintaan distribusi with details
router.get("/permintaan/:id", verifyToken, Controller.getPermintaanDistribusiById);

// ✅ Create new permintaan distribusi + details
router.post("/permintaan", verifyToken, Controller.createPermintaanDistribusi);

// ✅ Update header (not details)
router.put("/permintaan/:id", verifyToken, Controller.updatePermintaanDistribusi);

// ✅ Soft delete permintaan distribusi (header + related details)
router.delete("/permintaan/:id", verifyToken, Controller.deletePermintaanDistribusi);

// ✅ Edit one detail item (qty or qty_real)
router.put("/pemakaian/:id", verifyToken, Controller.pemakaianBarang);

// ✅ Edit one detail item (qty or qty_real)
router.put("/permintaan/detail/:id", verifyToken, Controller.editPermintaanDistribusiDetail);

// ✅ Soft delete one detail item
router.delete("/permintaan/detail/:id", verifyToken, Controller.deletePermintaanDistribusiDetail);


// GET all distribusi (with filters & pagination)
router.get("/distribusi", verifyToken, DistribusiController.getAllDistribusi);

// GET single distribusi by ID
router.get("/distribusi/:id", verifyToken, DistribusiController.getDistribusiById);

// POST create new distribusi
router.post("/distribusi", verifyToken, DistribusiController.createDistribusi);

// PUT update distribusi (only waktu_kirim)
router.put("/distribusi/:id", verifyToken, DistribusiController.updateDistribusi);

// DELETE soft delete distribusi
router.delete("/distribusi/:id", verifyToken, DistribusiController.deleteDistribusi);

export default router;
