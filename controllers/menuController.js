import { getMenusByRoleId, getAllRolesWithPrivileges, listAllMenus } from "../models/menuModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export async function getMenusByRole(req, res) {
  try {
    const roleId = req.user.role;
    const menus = await getMenusByRoleId(roleId);
    res.json(menus);
  } catch (err) {
    console.error("Error fetching menus:", err);
    res.status(500).json({ message: "Failed to load menus" });
  }
}

export async function getAllRolePrivileges(req, res) {
  try {
    const roles = await getAllRolesWithPrivileges();
    res.json(roles);
  } catch (err) {
    console.error("Error fetching privileges:", err);
    res.status(500).json({ message: "Failed to load privileges" });
  }
}


export const getAllMenus = async (req, res) => {
  try {
    const menus = await listAllMenus();
    sendResponse(res, menus, "Success");
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, "Failed to fetch menus", 500);
  }
};
