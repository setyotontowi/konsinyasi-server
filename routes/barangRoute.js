import express from "express";
import {
  listSatuan,
  getSatuan,
  addSatuan,
  editSatuan,
  removeSatuan,
} from "../controllers/barangController.js";

const router = express.Router();

// CRUD
router.get("/satuan", listSatuan);
router.get("/satuan/:id", getSatuan);
router.post("/satuan", addSatuan);
router.put("/satuan/:id", editSatuan);
router.delete("/satuan/:id", removeSatuan);

export default router;