import { listAllUnit } from "../models/unitModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const getAllUnit = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    const filters = {
        nama: req.query.nama || undefined,
        is_pbf: req.query.is_pbf || undefined
    };

    const { rows, total } = await listAllUnit({ page, limit, filters });
    sendPaginatedResponse(res, rows, page, limit, total);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};