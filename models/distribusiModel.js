import pool from "../config/db.js";

/**
 * Get all distribusi with optional filters.
 * Supports filter by id_master_unit, id_permintaan_distribusi, and waktu_kirim date range.
 */
export const getAllDistribusi = async (filters = {}) => {
  const { id_master_unit, id_permintaan_distribusi, start_date, end_date } = filters;

  let whereClauses = ["d.deleted_at IS NULL"];
  let values = [];

  if (id_master_unit) {
    whereClauses.push("d.id_master_unit = ?");
    values.push(id_master_unit);
  }

  if (id_permintaan_distribusi) {
    whereClauses.push("d.id_permintaan_distribusi = ?");
    values.push(id_permintaan_distribusi);
  }

  if (start_date && end_date) {
    whereClauses.push("DATE(d.waktu_kirim) BETWEEN ? AND ?");
    values.push(start_date, end_date);
  } else if (start_date) {
    whereClauses.push("DATE(d.waktu_kirim) >= ?");
    values.push(start_date);
  } else if (end_date) {
    whereClauses.push("DATE(d.waktu_kirim) <= ?");
    values.push(end_date);
  }

  const whereQuery = `WHERE ${whereClauses.join(" AND ")}`;

  const [rows] = await pool.query(
    `SELECT d.*, un.nama as nama_unit, u.nama as nama_user, ut.nama as nama_unit_tujuan
    FROM ts_distribusi d
    JOIN md_unit un ON (d.id_master_unit = un.id)
    JOIN md_users u ON (d.id_users = u.id)
    JOIN hd_permintaan_distribusi pd ON (d.id_permintaan_distribusi = pd.pd_id)
    JOIN md_unit ut ON (pd.id_master_unit_tujuan = ut.id)
    ${whereQuery} 
    ORDER BY id DESC`,
    values
  );

  return rows;
};

/**
 * Get distribusi by ID
 */
export const getDistribusiById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM ts_distribusi WHERE id = ?`, [id]);
  return rows[0] || null;
};

/**
 * Create new distribusi
 */
export const createDistribusi = async (data) => {
  const { id_permintaan_distribusi, id_master_unit, id_users} = data;

  const [result] = await pool.query(
    `INSERT INTO ts_distribusi (id_permintaan_distribusi, id_master_unit, id_users)
     VALUES (?, ?, ?)`,
    [id_permintaan_distribusi, id_master_unit, id_users]
  );

  return await getDistribusiById(result.insertId);
};

/**
 * Update distribusi (only waktu_kirim is editable)
 */
export const updateDistribusi = async (id, waktu_kirim) => {
  await pool.query(`UPDATE ts_distribusi SET waktu_kirim = ? WHERE id = ?`, [waktu_kirim, id]);
  return await getDistribusiById(id);
};

/**
 * Delete distribusi
 */
export const deleteDistribusi = async (id) => {
  const [result] = await pool.query(
    `UPDATE ts_distribusi SET deleted_at = NOW() WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};