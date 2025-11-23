import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";
import * as PurchaseModel from "../models/purchaseModel.js";
import fs from "fs-extra";
import { PDFDocument, StandardFonts } from "pdf-lib";
import pool from "../config/db.js";

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

// --------------------------
// PRINT PURCHASE ORDER
// --------------------------
export const printPurchaseOrder = async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Load PO header + detail
        const [poRows] = await pool.query(
            `SELECT * FROM hd_purchase_order WHERE id = ?`,
            [id]
        );

        if (poRows.length === 0)
            return sendResponse(res, {}, "Purchase order not found", 404);

        const po = poRows[0];

        const [detailRows] = await pool.query(
            `SELECT * FROM dt_purchase_order_detail WHERE id_po = ?`,
            [id]
        );

        // 2. Generate PDF
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([595, 842]); // A4
        const font = await pdf.embedFont(StandardFonts.Helvetica);

        let y = 800;

        page.drawText("PURCHASE ORDER", { x: 50, y, size: 20, font });
        y -= 30;

        page.drawText(`Tanggal Entri : ${po.tanggal_entri}`, { x: 50, y, size: 12, font });
        y -= 15;
        page.drawText(`Tanggal Datang : ${po.tanggal_datang}`, { x: 50, y, size: 12, font });
        y -= 15;
        page.drawText(`Subtotal : ${po.subtotal}`, { x: 50, y, size: 12, font });
        y -= 15;
        page.drawText(`PPN : ${po.ppn}%`, { x: 50, y, size: 12, font });
        y -= 15;
        page.drawText(`Total : ${po.total}`, { x: 50, y, size: 12, font });
        y -= 30;

        page.drawText("DETAIL BARANG:", { x: 50, y, size: 14, font });
        y -= 20;

        for (const d of detailRows) {
            page.drawText(
                `Barang #${d.id_barang} | Qty: ${d.permintaan} | Harga: ${d.harga_satuan}`,
                { x: 50, y, size: 12, font }
            );
            y -= 15;
            if (y < 50) break; // simple overflow protection
        }

        const pdfBytes = await pdf.save();

        // 3. Save to disk
        const dir = "./uploads/purchase";
        await fs.ensureDir(dir);

        const filePath = `${dir}/po-${id}.pdf`;
        await fs.writeFile(filePath, pdfBytes);

        const publicPath = `${req.protocol}://${req.get("host")}/uploads/purchase/po-${id}.pdf`;

        // 4. Save path into DB
        await PurchaseModel.savePurchaseOrderPrintPath(id, publicPath);

        return sendResponse(res, { id, print_path: publicPath }, "PDF generated");

    } catch (err) {
        console.error(err);
        return sendResponse(res, { error: err.message }, "Failed to generate PDF", 500);
    }
};

export const confirmPurchaseOrder = async (req, res) => {
    try {
        const id = req.params.id;

        await PurchaseModel.confirmPurchaseOrder(id);
        
        return sendResponse(res, { id }, "Purchase order confirmed");
    } catch (err) {
        return sendResponse(res, { error: err.message }, "Failed to confirm purchase order", 500);
    }
};
