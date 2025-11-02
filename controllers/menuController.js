import { getMenusByRoleId, getAllRolesWithPrivileges } from "../models/menuModel.js";

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
