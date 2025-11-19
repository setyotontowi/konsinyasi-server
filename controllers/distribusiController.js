import * as DistribusiModel from "../models/distribusiModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

/**
 * Get all distribusi (with pagination and filters)
 */
export const getAllDistribusi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const filters = {
      id_master_unit: req.query.id_master_unit,
      id_master_unit_tujuan: req.query.id_master_unit_tujuan,
      id_permintaan_distribusi: req.query.id_permintaan_distribusi,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    // 🔒 Restrict by unit if not admin
    if (req.user.role !== 1) {
      filters.id_master_unit = req.user.unit;
    }

    const allItems = await DistribusiModel.getAllDistribusi(filters);
    const total = allItems.length;

    // Apply pagination on the controller side
    const items = allItems.slice(offset, offset + limit);

    return sendPaginatedResponse(res, items, page, limit, total);
  } catch (err) {
    console.error(err);
    return sendResponse(res, {}, "Failed to fetch distribusi", 500);
  }
};

/**
 * Get distribusi by ID
 */
export const getDistribusiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await DistribusiModel.getDistribusiById(id);

    if (!data) return sendResponse(res, {}, "Distribusi not found", 404);

    return sendResponse(res, data);
  } catch (err) {
    console.error(err);
    return sendResponse(res, {}, "Failed to fetch distribusi", 500);
  }
};

/**
 * Create new distribusi
 */
export const createDistribusi = async (req, res) => {
  try {
    let { id_permintaan_distribusi, id_master_unit, id_users } = req.body;

    if (!id_permintaan_distribusi || !id_master_unit || !id_users) {
      return sendResponse(res, {}, "Missing required fields", 400);
    }

    // 🔒 Restrict by unit if not admin
    if (req.user.role !== 1) {
      id_master_unit = req.user.unit;
      id_users = req.user.id;
    }

    const newData = await DistribusiModel.createDistribusi({
      id_permintaan_distribusi,
      id_master_unit,
      id_users,
    });

    return sendResponse(res, newData, "Distribusi created successfully", 201);
  } catch (err) {
    console.error(err);
    return sendResponse(res, {}, "Failed to create distribusi", 500);
  }
};

/**
 * Update distribusi (only waktu_kirim)
 */
export const updateDistribusi = async (req, res) => {
  try {
    const { id } = req.params;
    const { waktu_kirim } = req.body;

    if (!waktu_kirim) {
      return sendResponse(res, {}, "Only waktu_kirim can be updated", 400);
    }

    const existing = await DistribusiModel.getDistribusiById(id);
    if (!existing) return sendResponse(res, {}, "Distribusi not found", 404);

    const updated = await DistribusiModel.updateDistribusi(id, waktu_kirim);
    return sendResponse(res, updated, "Distribusi updated successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, {}, "Failed to update distribusi", 500);
  }
};

/**
 * Soft delete distribusi (set deleted_at)
 */
export const deleteDistribusi = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await DistribusiModel.getDistribusiById(id);
    if (!existing) return sendResponse(res, {}, "Distribusi not found", 404);

    const deleted = await DistribusiModel.deleteDistribusi(id);
    if (!deleted) return sendResponse(res, {}, "Failed to delete distribusi", 400);

    return sendResponse(res, {}, "Distribusi deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, {}, "Failed to delete distribusi", 500);
  }
};
