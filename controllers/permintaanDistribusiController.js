import * as PermintaanModel from "../models/permintaanDistribusiModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

/**
 * ✅ GET /permintaan
 * List all permintaan distribusi with optional filters and pagination
 */
export const getAllPermintaanDistribusi = async (req, res) => {
  try {
    const { page = 1, limit = 20, start, end, id_master_unit, id_master_unit_tujuan, search, permintaan } = req.query;
    const user = req.user; // from JWT middleware

    // Build filters
    const permintaanDistribusi = permintaan === 'true'? 1 : 0
    const filters = { start, end, id_master_unit, id_master_unit_tujuan, search, permintaanDistribusi };

    // 🔒 Restrict by unit if not admin
    if (user.role !== 1) {
      filters.id_master_unit = user.unit;
    }

    const result = await PermintaanModel.getAllPermintaanDistribusi({
      page: Number(page),
      limit: Number(limit),
      filters,
      user,
    });

    const { data: items, pagination } = result;
    const { total } = pagination;

    return sendPaginatedResponse(res, items, pagination.page, pagination.limit, total);
  } catch (error) {
    console.error("Error fetching permintaan:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ GET /permintaan/:id
 * Get single permintaan distribusi (with detail items)
 */
export const getPermintaanDistribusiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await PermintaanModel.getPermintaanDistribusiById(id);

    if (!data) {
      return sendResponse(res, {}, "Data not found", 404);
    }

    return sendResponse(res, data);
  } catch (error) {
    console.error("Error fetching permintaan by ID:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ POST /permintaan
 * Create new permintaan distribusi + detail items
 */
export const createPermintaanDistribusi = async (req, res) => {
  try {
    const user = req.user; // from JWT
    const data = req.body;

    if (user.role !== 1) {
       data.id_master_unit = user.unit;
    }

    const result = await PermintaanModel.createPermintaanDistribusi(data, user);
    return sendResponse(res, { pd_id: result.pd_id }, "Permintaan distribusi created successfully", 201);
  } catch (error) {
    return sendResponse(res, error, "Failed to create permintaan distribusi", 500);
  }
};

/**
 * ✅ PUT /permintaan/:id
 * Update existing permintaan distribusi (header only)
 */
export const updatePermintaanDistribusi = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, pd_id: id };

    const updated = await PermintaanModel.updatePermintaanDistribusi(data);
    if (!updated) {
      return sendResponse(res, {}, "Data not found or not updated", 404);
    }

    return sendResponse(res, {}, "Permintaan distribusi updated successfully");
  } catch (error) {
    console.error("Error updating permintaan:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ DELETE /permintaan/:id
 * Soft delete header and all details
 */
export const deletePermintaanDistribusi = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PermintaanModel.deletePermintaanDistribusi(id);
    if (!deleted) {
      return sendResponse(res, {}, "Data not found", 404);
    }

    return sendResponse(res, {}, "Permintaan distribusi deleted successfully");
  } catch (error) {
    console.error("Error deleting permintaan:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ PUT /permintaan/detail/:id
 * Edit detail item (qty or qty_real)
 */
export const editPermintaanDistribusiDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body, pdd_id: id };

    const updated = await PermintaanModel.editPermintaanDistribusiDetail(data);
    if (!updated) {
      return sendResponse(res, {}, "Detail not found or not updated", 404);
    }

    return sendResponse(res, {}, "Detail updated successfully");
  } catch (error) {
    console.error("Error updating detail:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ DELETE /permintaan/detail/:id
 * Soft delete one detail item
 */
export const deletePermintaanDistribusiDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PermintaanModel.deletePermintaanDistribusiDetail(id);
    if (!deleted) {
      return sendResponse(res, {}, "Detail not found", 404);
    }

    return sendResponse(res, {}, "Detail deleted successfully");
  } catch (error) {
    console.error("Error deleting detail:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};

/**
 * ✅ PUT /pemakaian
 * Update qty real
 */
export const pemakaianBarang = async (req, res) => {
  try {
    const data = { ...req.body };

    data.id_users = req.user.id
    data.id_master_unit = req.user.id_master_unit

    const updated = await PermintaanModel.pemakaianBarang(data);
    if (!updated) {
      return sendResponse(res, {}, "Data not found or not updated", 404);
    }

    return sendResponse(res, {}, "Permintaan distribusi updated successfully");
  } catch (error) {
    console.error("Error updating permintaan:", error);
    return sendResponse(res, {}, "Internal Server Error", 500);
  }
};
