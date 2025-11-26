// controllers/stokOpnameController.js
import { createStokOpname, getAllStokOpname, getStokOpnameById, updateStokOpname } from "../models/stokOpnameModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";


const GROUP_VENDOR = 3;


export const createStokOpnameController = async (req, res) => {
  try {
    const id_users = req.user?.id || req.body.id_users; // if using auth middleware, fallback to body
    const data = req.body;

    // Basic validation
    if (!data.waktu_input || !data.id_master_unit) {
      return res.status(400).json({
        status: 400,
        message: "waktu_input dan id_master_unit harus diisi",
      });
    }

    const result = await createStokOpname(data, id_users);

    return res.status(201).json({
      status: 201,
      message: "Stok opname berhasil disimpan",
      data: result,
    });
  } catch (err) {
    console.error("Error in createStokOpnameController:", err);
    return res.status(500).json({
      status: 500,
      message: err.message || "Terjadi kesalahan saat menyimpan stok opname",
    });
  }
};

export const getStokOpname = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filters = {
      start: req.query.start_date,
      end: req.query.end_date,
      id_master_unit: req.query.id_master_unit,
    };

    const user = req.user || {}; // assuming middleware sets this

    if (req.user && req.user.role === GROUP_VENDOR) {
      filters = { ...filters, id_master_unit: req.user.unit };
    }

    const { data, pagination } = await getAllStokOpname({
      page,
      limit,
      filters,
      user,
    });

    return sendPaginatedResponse(res, data, pagination.page, pagination.limit, pagination.total);
  } catch (error) {
    console.error("Error fetching stok opname:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const fetchStokOpnameById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "ID stok opname wajib diisi",
      });
    }

    const data = await getStokOpnameById(id);

    return sendResponse(res, data);
  } catch (error) {
    console.error("Error fetching stok opname by ID:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

import {
  getDistinctEDsByBarang,
  getDistinctNoBatchByBarangAndEd
} from "../models/stokOpnameModel.js";

// ✅ GET /inventory/barang/:id/eds
export const getEDListByBarang = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID barang wajib diisi" });
    }

    const rows = await getDistinctEDsByBarang(id);

    return sendResponse(res, rows);
  } catch (err) {
    console.error("getEDListByBarang error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar ED",
      error: err.message
    });
  }
};


// ✅ GET /inventory/barang/:id/nobatch?ed=YYYY-MM-DD
export const getNoBatchListByBarangAndEd = async (req, res) => {
  try {
    const { id } = req.params;
    const { ed } = req.query;

    if (!id || !ed) {
      return res.status(400).json({
        message: "Parameter 'id' dan 'ed' wajib diisi"
      });
    }

    const rows = await getDistinctNoBatchByBarangAndEd(id, ed);

    return sendResponse(res, rows);
  } catch (err) {
    console.error("getNoBatchListByBarangAndEd error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar No Batch",
      error: err.message
    });
  }
};

import { calculateStok } from "../models/stokModel.js";

export const checkStock = async (req, res) => {
  try {
    const { barang, nobatch, ed } = req.body;

    if (!barang || !nobatch || !ed) {
      return res.status(400).json({
        success: false,
        message: "barang, nobatch, dan ed wajib diisi",
      });
    }

    const stockData = await calculateStok({
      id_barang: barang,
      nobatch,
      ed,
    });

    // Fallback: ensure consistent structure
    const sisa = stockData?.sisa ?? 0;

    return res.status(200).json({
      success: true,
      data: { sisa },
    });
  } catch (err) {
    console.error("checkStock error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal memeriksa stok",
      error: err.message,
    });
  }
};


export const updateStokOpnameController = async (req, res) => {
  try {
    const { id } = req.params;
    const id_users = req.user?.id || req.body.id_users;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID stok opname wajib diisi" });
    }

    const result = await updateStokOpname(id, data, id_users);

    return res.status(200).json({
      success: true,
      message: "Stok opname berhasil diperbarui",
      data: result,
    });
  } catch (err) {
    console.error("updateStokOpnameController error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Gagal memperbarui stok opname",
    });
  }
};
