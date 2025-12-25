import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getUsedItems,
  getUsedItemsBulk,
  listPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderBulk,
  updatePurchaseOrder,
  deletePurchaseOrder,
  printPurchaseOrder,
  confirmPurchaseOrder,
  getPurchaseOrderDetail,
} from "../controllers/purchaseController.js";

const router = express.Router();

/** BASE PATH: /purchase **/

// list used items
router.get("/used-items", verifyToken, getUsedItems);

router.get("/used-items-bulk", verifyToken, getUsedItemsBulk);

// list purchase orders with filters
router.get("/", verifyToken, listPurchaseOrders);

// list purchase orders with filters
router.get("/:id_po", verifyToken, getPurchaseOrderDetail);

// create purchase order
router.post("/", verifyToken, createPurchaseOrder);

// create purchase order
router.post("/bulk", verifyToken, createPurchaseOrderBulk);

// update header only
router.put("/:id", verifyToken, updatePurchaseOrder);

// soft delete
router.delete("/:id", verifyToken, deletePurchaseOrder);

router.post("/:id/print", verifyToken, printPurchaseOrder);

router.post("/:id/confirm", verifyToken, confirmPurchaseOrder);

export default router;
