import { listAllUserGroups, changeUserGroup } from "../models/userGroupModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const getAllUserGroups = async (req, res) => {
  try {
    const rows = await listAllUserGroups();
    sendResponse(res, rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserGroup = async (req, res) => {
  try {
    const { id_user, id_new_group } = req.body;

    if (!id_user || !id_new_group) {
      return sendResponse(res, {}, 'id user and new group id are required', 400);
    }

    const updated = await changeUserGroup(id_user, id_new_group);
    if (!updated) return sendResponse(res, {}, 'User not found', 404);

    sendResponse(res, {}, 'User group updated successfully');
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, 'Failed to update user group', 500);
  }
};