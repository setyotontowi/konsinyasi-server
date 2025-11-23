import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";
import * as PurchaseModel from "../models/purchaseModel.js";

// --------------------------
// GET USED ITEMS
// --------------------------
export const getUsedItems = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 20;

        const { rows, total } = await PurchaseModel.listUsedbarang({ page, limit });

        return sendPaginatedResponse(res, rows, page, limit, total);
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to load used items", 500);
    }
};

// --------------------------
// LIST PURCHASE ORDERS
// --------------------------
export const listPurchaseOrders = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 20;

        const { page: _p, limit: _l, ...filters } = req.query;
        const parsedFilters = Object.keys(filters).length ? filters : null;

        const { rows, total } = await PurchaseModel.listPurchaseOrders({
            page,
            limit,
            filters: parsedFilters
        });

        return sendPaginatedResponse(res, rows, page, limit, total);
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to load purchase orders", 500);
    }
};

// --------------------------
// CREATE PURCHASE ORDER
// --------------------------
export const createPurchaseOrder = async (req, res) => {
    try {
        const id_po = await PurchaseModel.createPurchaseOrder(
            { ...req.body, id_users: req.user.id },
            req.body.items || []
        );

        return sendResponse(res, { id_po }, "Purchase order created", 201);
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to create purchase order", 500);
    }
};

// --------------------------
// UPDATE HEADER
// --------------------------
export const updatePurchaseOrder = async (req, res) => {
    try {
        await PurchaseModel.updatePurchaseOrder(req.params.id, req.body);
        return sendResponse(res, {}, "Purchase order updated");
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to update purchase order", 500);
    }
};

// --------------------------
// SOFT DELETE
// --------------------------
export const deletePurchaseOrder = async (req, res) => {
    try {
        await PurchaseModel.deletePurchaseOrder(req.params.id);
        return sendResponse(res, {}, "Purchase order deleted");
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to delete purchase order", 500);
    }
};
