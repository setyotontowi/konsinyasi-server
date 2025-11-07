import pool from "../config/db.js";

export const listAllUserGroups = async () => {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.group_nama,
        COUNT(u.id) AS user_count
    FROM 
        md_users_group g
    LEFT JOIN 
        md_users u 
        ON u.id_users_group = g.id
        AND u.status_active = 'Ya' 
    GROUP BY 
        g.id, g.group_nama
    ORDER BY 
        g.group_nama;`
  );

  return rows;
}

export const changeUserGroup = async (userId, newGroupId) => {
  const [result] = await pool.query(
    'UPDATE md_users SET id_users_group = ? WHERE id = ?',
    [newGroupId, userId]
  );
  return result.affectedRows; // 1 if success, 0 if user not found
};

// Get all menu privileges for a group
export const getUserGroupPrivileges = async (groupId) => {
  const [rows] = await pool.query(
    `SELECT menu_id FROM st_users_group_privilege WHERE user_group_id = ?`,
    [groupId]
  );
  return rows.map((r) => r.menu_id);
};

// Update (replace) menu privileges for a group
export const setUserGroupPrivileges = async (groupId, menuIds) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Delete old privileges
    await conn.query(
      `DELETE FROM st_users_group_privilege WHERE user_group_id = ?`,
      [groupId]
    );

    // Insert new privileges if provided
    if (menuIds && menuIds.length > 0) {
      const values = menuIds.map((menuId) => [groupId, menuId]);
      await conn.query(
        `INSERT INTO st_users_group_privilege (user_group_id, menu_id) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Add User Group
export const insertUserGroup = async (group_nama) => {
  const [result] = await pool.query(
    `INSERT INTO md_users_group (group_nama)
     VALUES (?)`,
    [group_nama.group_nama]
  );
  return result.insertId;
};