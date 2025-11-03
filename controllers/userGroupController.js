import { listAllUserGroups, changeUserGroup, getUserGroupPrivileges, setUserGroupPrivileges, } from "../models/userGroupModel.js";
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

// GET /user/group/:id/privilege
export const getUserGroupPrivilege = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return sendResponse(res, {}, "Missing user_group_id", 400);

    const menuIds = await getUserGroupPrivileges(id);
    sendResponse(res, { menu_ids: menuIds }, "Success");
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, "Failed to get privileges", 500);
  }
};

// POST /user/group/:id/privilege
export const updateUserGroupPrivilege = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_ids } = req.body;

    if (!id) return sendResponse(res, {}, "Missing user_group_id", 400);
    if (!Array.isArray(menu_ids))
      return sendResponse(res, {}, "menu_ids must be an array", 400);

    await setUserGroupPrivileges(id, menu_ids);
    sendResponse(res, {}, "Privileges updated successfully");
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, "Failed to update privileges", 500);
  }
};