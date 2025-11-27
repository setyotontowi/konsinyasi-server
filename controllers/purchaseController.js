import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";
import * as PurchaseModel from "../models/purchaseModel.js";
import fs from "fs-extra";
import { PDFDocument, StandardFonts } from "pdf-lib";
import pool from "../config/db.js";
import path from "path";
import puppeteer from "puppeteer";
import { GROUP_VENDOR } from "../helpers/utilHelper.js";


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
        let parsedFilters = Object.keys(filters).length ? filters : null;

        if (req.user && req.user.role === GROUP_VENDOR) {
            parsedFilters = {...parsedFilters, id_master_unit_supplier:req.user.unit}
        }

        console.log(req.user)
        console.log(parsedFilters)

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
function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}


export const printPurchaseOrder = async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Load PO header + detail
        const [poRows] = await pool.query(`
            SELECT 
                hpo.*,
                hpd.nomor_rm,
                hpd.nama_pasien,
                hpd.nama_ruang,
                hpd.diagnosa,
                mu_asal.nama AS unit_asal,
                mu_tujuan.nama AS unit_tujuan
            FROM hd_purchase_order hpo
            LEFT JOIN hd_permintaan_distribusi hpd
                ON hpo.id_permintaan_distribusi = hpd.pd_id
            LEFT JOIN md_unit mu_asal
                ON hpd.id_master_unit = mu_asal.id
            LEFT JOIN md_unit mu_tujuan
                ON hpd.id_master_unit_tujuan = mu_tujuan.id
            WHERE hpo.id = ?
        `, [id]);

        if (poRows.length === 0)
            return sendResponse(res, {}, "Purchase order not found", 404);

        const po = poRows[0];

        const [detailRows] = await pool.query(
            `SELECT pod.*, b.barang_nama as nama_barang, s.mst_nama as satuan
            FROM dt_purchase_order_detail pod
            JOIN md_barang b on pod.id_barang = b.barang_id
            JOIN md_satuan s on b.id_satuan_kecil = s.mst_id
            WHERE id_po = ?`,
            [id]
        );

        // 1. Load template
        const templatePath = path.join(process.cwd(), "template/purchase_order.html");
        let html = await fs.readFile(templatePath, "utf8");

        // Replace placeholders
        html = html
        .replace("{{tanggal_entri}}", formatDateTime(po.tanggal_entri))
        .replace("{{tanggal_datang}}", formatDateTime(po.tanggal_datang))
        .replace("{{unit_asal}}", po.unit_asal || "-")
        .replace("{{unit_tujuan}}", po.unit_tujuan || "-")
        .replace("{{nomor_rm}}", po.nomor_rm || "-")
        .replace("{{nama_pasien}}", po.nama_pasien || "-")
        .replace("{{nama_ruang}}", po.nama_ruang || "-")
        .replace("{{diagnosa}}", po.diagnosa || "-")
        .replace("{{subtotal}}", po.subtotal)
        .replace("{{ppn}}", po.ppn)
        .replace("{{ppn_value}}", (po.subtotal * po.ppn/100))

        // Generate HTML table rows
        let rowHtml = "";
        let subtotal = 0;
        for (const d of detailRows) {
            rowHtml += `
                <tr>
                <td>${d.nama_barang}</td>
                <td>${d.satuan}</td>
                <td>${d.permintaan}</td>
                <td>${d.harga_satuan}</td>
                <td>${d.harga_satuan * d.permintaan}</td>
                </tr>
            `;
            subtotal += d.subtotal
        }

        html = html.replace("{{detail_rows}}", rowHtml);
        html = html.replace("{{subtotal}}", subtotal)

        subtotal = Number(po.subtotal) || 0;
        const ppn = Number(po.ppn) || 0;

        const ppnCalc = subtotal * (ppn / 100);
        const total = subtotal + ppnCalc;

        html = html.replace("{{total}}", total);

        // 2. Launch headless chrome
        const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const pageObj = await browser.newPage();
        await pageObj.setContent(html, { waitUntil: "networkidle0" });

        // 3. Save PDF
        const dir = "./uploads/purchase";
        await fs.ensureDir(dir);

        const filePath = `${dir}/po-${id}.pdf`;
        await pageObj.pdf({ path: filePath, format: "A4", printBackground: true });

        await browser.close();

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
