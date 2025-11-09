// controllers/stokOpnameController.js
import { createStokOpname, getAllStokOpname, getStokOpnameById } from "../models/stokOpnameModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

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

    const filters = {
      start: req.query.start,
      end: req.query.end,
    };

    const user = req.user || {}; // assuming middleware sets this

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
