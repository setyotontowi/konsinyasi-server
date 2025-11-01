
import { listAllUsers } from "../models/userModel.js";
import { sendPaginatedResponse } from "../helpers/responseHelper.js";

export const getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    const filters = {
        username: req.query.username || undefined,
        status_active: req.query.status_active !== undefined ? Number(req.query.status_active) : undefined,
        nip: req.query.nip || undefined,
    };

    const { rows, total } = await listAllUsers({ page, limit, filters });

    sendPaginatedResponse(res, rows, page, limit, total);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
