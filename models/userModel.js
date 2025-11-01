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

export const listAllUsers = async () => {
  const [rows] = await pool.query(
    "SELECT id, username, nama, nip, status_active FROM md_users"
  );
  return rows;
};