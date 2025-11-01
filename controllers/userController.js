
import { listAllUsers, getUserById } from "../models/userModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    const filters = {
        username: req.query.username || undefined,
        status_active: req.query.status_active !== undefined ? Number(req.query.status_active) : undefined,
        nip: req.query.nip || undefined,
        id_users_group: req.query.id_users_group ? Number(req.query.id_users_group) : undefined
    };

    const { rows, total } = await listAllUsers({ page, limit, filters });

    sendPaginatedResponse(res, rows, page, limit, total);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticate middleware
    const user = await getUserById(userId);

    if (!user) return sendResponse(res, {}, 'User not found', 404);

    sendResponse(res, user);
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, 'Failed to fetch profile', 500);
  }
};

