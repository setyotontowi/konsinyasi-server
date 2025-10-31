import pool from "../config/db.js";

export const findByUsername = async (username) => {
  const [rows] = await pool.query(
    "SELECT * FROM md_users WHERE username = ? AND status_active = 1 LIMIT 1",
    [username]
  );
  return rows[0];
};

export const createUser = async (userData) => {
  const { username, password, nama, status_active = 1 } = userData;
  const [result] = await pool.query(
    `INSERT INTO md_users (username, password, nama, status_active, id_users_group)
     VALUES (?, ?, ?, ?, 1)`,
    [username, password, nama, status_active]
  );
  return result.insertId;
};