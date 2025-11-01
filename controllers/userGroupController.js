import { listAllUserGroups } from "../models/userGroupModel.js";
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