import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getUsedItems,
  getUsedItemsBulk,
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  printPurchaseOrder,
  confirmPurchaseOrder,
} from "../controllers/purchaseController.js";

const router = express.Router();

/** BASE PATH: /purchase **/

// list used items
router.get("/used-items", verifyToken, getUsedItems);

router.get("/used-items-bulk", verifyToken, getUsedItemsBulk);

// list purchase orders with filters
router.get("/", verifyToken, listPurchaseOrders);

// create purchase order
router.post("/", verifyToken, createPurchaseOrder);

// update header only
router.put("/:id", verifyToken, updatePurchaseOrder);

// soft delete
router.delete("/:id", verifyToken, deletePurchaseOrder);

router.post("/:id/print", verifyToken, printPurchaseOrder);

router.post("/:id/confirm", verifyToken, confirmPurchaseOrder);

export default router;
