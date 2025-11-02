
import { listAllUsers, getUserById, updateUserProfile } from "../models/userModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    const filters = {
        user: req.query.user || undefined,
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


export const changeProfile = async (req, res) => {
  try {

    const allowedFields = ['username', 'nama', 'nip', 'password', 'status_active'];
    
    // Filter request body to only allowed fields
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Determine which user to update
    let userId;
    if (req.user.role === 1 && req.body.id) {
      userId = req.body.id; // admin can update any user
    } else {
      userId = req.user.id; // normal user can update self
    }


    if (Object.keys(updateData).length === 0)
      return sendResponse(res, {}, 'No valid fields provided', 400);

    const updated = await updateUserProfile(userId, updateData);

    if (!updated) return sendResponse(res, {}, 'User not found', 404);

    const user = await getUserById(userId); // return updated profile
    sendResponse(res, user, 'Profile updated successfully');
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, 'Failed to update profile', 500);
  }
};
