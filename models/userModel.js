import pool from "../config/db.js";

export const findByUsername = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM md_users WHERE username = ? AND status_active = 1 LIMIT 1",
    [username]
  );
  return rows[0];
};

export const createUser = async (userData) => {
  const { username, password, nama, status_active = 1, id_users_group } = userData;
  const [result] = await pool.query(
    `INSERT INTO md_users (username, password, nama, status_active, id_users_group)
     VALUES (?, ?, ?, ?, ?)`,
    [username, password, nama, status_active, id_users_group]
  );
  return result.insertId;
};

export const listAllUsers = async ({ page = 1, limit = 20, filters = {} } = {}) => {
  const offset = (page - 1) * limit;

  // build WHERE clauses dynamically
  let whereClauses = [];
  let params = [];

  if (filters.user) {
    whereClauses.push('(username LIKE ? or u.nama LIKE ?)');
    params.push(`%${filters.user}%`, `%${filters.user}%`);
  }

  if (filters.status_active !== undefined) {
    whereClauses.push('status_active = ?');
    params.push(filters.status_active);
  }

  if (filters.nip) {
    whereClauses.push('nip = ?');
    params.push(filters.nip);
  }

  if (filters.id_users_group) {
    whereClauses.push('id_users_group = ?');
    params.push(filters.id_users_group);
  }

  const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // get total count
  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM md_users u ${whereSQL}`, params);
  const total = countRows[0].total;

  // get paginated rows
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.nama, u.nip, u.status_active, u.id_users_group, g.group_nama, un.nama as nama_unit
     FROM md_users u
     LEFT JOIN md_users_group g ON u.id_users_group = g.id
     LEFT JOIN md_unit un ON u.id_master_unit = un.id
     ${whereSQL} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    rows,
    total
  };
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, nama, nip, status_active, created_at FROM md_users WHERE id = ?',
    [id]
  );
  return rows[0]; // return single user
};


export const updateUserProfile = async (userId, data) => {
  // Build dynamic SET clause
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) return 0; // nothing to update

  values.push(userId); // for WHERE clause

  const [result] = await pool.query(
    `UPDATE md_users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );


  return result.affectedRows; // 1 if updated, 0 if user not found
};