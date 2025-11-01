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

export const listAllUsers = async ({ page = 1, limit = 10, filters = {} } = {}) => {
  const offset = (page - 1) * limit;

  // build WHERE clauses dynamically
  let whereClauses = [];
  let params = [];

  if (filters.username) {
    whereClauses.push('username LIKE ?');
    params.push(`%${filters.username}%`);
  }

  if (filters.status_active !== undefined) {
    whereClauses.push('status_active = ?');
    params.push(filters.status_active);
  }

  if (filters.nip) {
    whereClauses.push('nip = ?');
    params.push(filters.nip);
  }

  const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // get total count
  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM md_users ${whereSQL}`, params);
  const total = countRows[0].total;

  // get paginated rows
  const [rows] = await pool.query(
    `SELECT id, username, nama, nip, status_active FROM md_users ${whereSQL} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    rows,
    total
  };
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, username, nama, nip, status_active FROM md_users WHERE id = ?',
    [id]
  );
  return rows[0]; // return single user
};