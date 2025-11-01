import {
  getAllSatuan,
  getSatuanById,
  createSatuan,
  updateSatuan,
  deleteSatuan,
} from "../models/barangModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const listSatuan = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    const filters = {
        nama: req.query.nama || undefined,
    };


    const { rows, total } = await getAllSatuan({ page, limit, filters } );
    sendPaginatedResponse(res, rows, page, limit, total);
  } catch (err) {
    console.log(err);
    sendResponse(res, {}, "Failed to fetch satuan", 500);
  }
};

export const getSatuan = async (req, res) => {
  try {
    const data = await getSatuanById(req.params.id);
    if (!data) return sendResponse(res, {}, "Satuan not found", 404);
    sendResponse(res, data, "Satuan detail");
  } catch (err) {
    sendResponse(res, {}, "Failed to fetch satuan", 500);
  }
};

export const addSatuan = async (req, res) => {
  try {
    if (!req.body.mst_nama)
      return sendResponse(res, {}, "mst_nama is required", 400);

    const data = await createSatuan(req.body);
    sendResponse(res, data, "Satuan created successfully", 201);
  } catch (err) {
    sendResponse(res, {}, "Failed to create satuan", 500);
  }
};

export const editSatuan = async (req, res) => {
  try {
    const updated = await updateSatuan(req.params.id, req.body);
    if (!updated) return sendResponse(res, {}, "Satuan not found", 404);
    sendResponse(res, {}, "Satuan updated successfully");
  } catch (err) {
    sendResponse(res, {}, "Failed to update satuan", 500);
  }
};

export const removeSatuan = async (req, res) => {
  try {
    const deleted = await deleteSatuan(req.params.id);
    if (!deleted) return sendResponse(res, {}, "Satuan not found", 404);
    sendResponse(res, {}, "Satuan deleted successfully");
  } catch (err) {
    sendResponse(res, {}, "Failed to delete satuan", 500);
  }
};
