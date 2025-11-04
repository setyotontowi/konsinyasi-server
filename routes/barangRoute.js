import express from "express";
import {
  listSatuan,
  getSatuan,
  addSatuan,
  editSatuan,
  removeSatuan,
  listItems,
  getItem,
  addItem,
  editItem,
  removeItem,
} from "../controllers/barangController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CRUD
router.get("/satuan", listSatuan);
router.get("/satuan/:id", getSatuan);
router.post("/satuan", addSatuan);
router.put("/satuan/:id", editSatuan);
router.delete("/satuan/:id", removeSatuan);

router.get("/items", verifyToken, listItems);
router.get("/item/:id", verifyToken, getItem);
router.post("/item", verifyToken, addItem);
router.put("/item/:id", verifyToken, editItem);
router.delete("/item/:id", verifyToken, removeItem);

export default router;