import pool from "../config/db.js"; // your mysql2 or pool connection

export async function getMenusByRoleId(roleId) {
  const [rows] = await pool.query(`
    SELECT m.id, m.nama, m.path, m.icon, m.id_parent
    FROM md_menu m
    JOIN st_users_group_privilege rm ON rm.menu_id = m.id
    WHERE rm.user_group_id = ? AND m.is_active = 1
    ORDER BY m.id_parent, m.order, m.id
  `, [roleId]);

  // --- Nesting logic ---
  const map = {};
  const roots = [];

  rows.forEach(row => {
    map[row.id] = { ...row, children: [] };
  });

  rows.forEach(row => {
    if (row.id_parent) {
      map[row.id_parent]?.children.push(map[row.id]);
    } else {
      roots.push(map[row.id]);
    }
  });

  return roots;
}

export async function getAllRolesWithPrivileges() {
  // Step 1: Fetch all roles
  const [roles] = await pool.query(`
    SELECT id AS role_id, group_nama AS role_name
    FROM md_users_group
    ORDER BY id
  `);

  // Step 2: Fetch all menus + privilege mapping
  const [roleMenus] = await pool.query(`
    SELECT rm.user_group_id as role_id, m.id AS menu_id, m.nama AS menu_name, m.path, m.icon, m.id_parent
    FROM md_menu m
    LEFT JOIN st_users_group_privilege rm ON rm.menu_id = m.id
    ORDER BY m.id_parent, m.id
  `);

  // Step 3: Group by role
  const result = roles.map(role => {
    const menus = roleMenus
      .filter(rm => rm.role_id === role.role_id)
      .map(rm => ({
        id: rm.menu_id,
        name: rm.menu_name,
        path: rm.path,
        icon: rm.icon,
        parent_id: rm.id_parent,
      }));

    // Optional: convert flat menus → nested structure per role
    const map = {};
    const roots = [];

    menus.forEach(m => (map[m.id] = { ...m, children: [] }));
    menus.forEach(m => {
      if (m.parent_id && map[m.parent_id]) map[m.parent_id].children.push(map[m.id]);
      else roots.push(map[m.id]);
    });

    return {
      role_id: role.role_id,
      role_name: role.role_name,
      menus: roots
    };
  });

  return result;
}

export async function listAllMenus() {
  const [rows] = await pool.query(`
    SELECT m.id, m.nama, m.path, m.icon, m.id_parent
    FROM md_menu m
    WHERE m.is_active = 1
    ORDER BY m.id_parent, m.order, m.id
  `);

  // --- Nesting logic ---
  const map = {};
  const roots = [];

  rows.forEach(row => {
    map[row.id] = { ...row, children: [] };
  });

  rows.forEach(row => {
    if (row.id_parent) {
      map[row.id_parent]?.children.push(map[row.id]);
    } else {
      roots.push(map[row.id]);
    }
  });

  return roots;
}