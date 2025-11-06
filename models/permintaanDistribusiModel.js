import pool from "../config/db.js";

// --------------------------
// Create new permintaan distribusi + details
// --------------------------
export const createPermintaanDistribusi = async (data, user) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id_master_unit, id_master_unit_tujuan, nomor_rm, nama_pasien, diagnosa, items } = data;

    // Insert header record
    const [headerResult] = await conn.query(
      `INSERT INTO ls_permintaan_distribusi 
       (id_master_unit, id_master_unit_tujuan, id_users, nomor_rm, nama_pasien, diagnosa, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id_master_unit, id_master_unit_tujuan, user.id, nomor_rm, nama_pasien, diagnosa]
    );

    const pd_id = headerResult.insertId;

    // Insert details
    if (Array.isArray(items) && items.length > 0) {
      const values = items.map((item) => [
        pd_id,
        item.id_master_barang,
        item.id_master_satuan,
        item.qty,
        new Date(),
      ]);

      await conn.query(
        `INSERT INTO dt_permintaan_distribusi_detail 
         (pd_id, id_master_barang, id_master_satuan, qty, waktu_input)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return { success: true, pd_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// --------------------------
// Get all permintaan distribusi (with filters and pagination)
// --------------------------
export const getAllPermintaanDistribusi = async ({ 
  page = 1, 
  limit = 20, 
  filters = {}, 
  user = {} 
} = {}) => {
  const offset = (page - 1) * limit;

  let where = "WHERE deleted_at IS NULL";
  const params = [];

  // 🔹 Restrict non-admin users
  if (user.role !== 1 && user.id_master_unit) {
    where += " AND id_master_unit = ?";
    params.push(user.id_master_unit);
  }

  // 🔹 Additional filters
  if (filters.start && filters.end) {
    where += " AND waktu BETWEEN ? AND ?";
    params.push(filters.start, filters.end);
  }

  if (filters.id_master_unit_tujuan) {
    where += " AND id_master_unit_tujuan = ?";
    params.push(filters.id_master_unit_tujuan);
  }

  if (filters.nomor_rm) {
    where += " AND nomor_rm LIKE ?";
    params.push(`%${filters.nomor_rm}%`);
  }

  if (filters.nama_pasien) {
    where += " AND nama_pasien LIKE ?";
    params.push(`%${filters.nama_pasien}%`);
  }

  const [rows] = await pool.query(
    `SELECT * FROM ls_permintaan_distribusi ${where} ORDER BY waktu DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ls_permintaan_distribusi ${where}`,
    params
  );

  return {
    data: rows,
    pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
};

// --------------------------
// Get permintaan distribusi by ID (with details)
// --------------------------
export const getPermintaanDistribusiById = async (id) => {
  const [[header]] = await pool.query(
    `SELECT * FROM ls_permintaan_distribusi WHERE pd_id = ? AND deleted_at IS NULL`,
    [id]
  );

  if (!header) return null;

  const [details] = await pool.query(
    `SELECT * FROM dt_permintaan_distribusi_detail WHERE pd_id = ? AND deleted_at IS NULL`,
    [id]
  );

  return { ...header, items: details };
};

// --------------------------
// Update header permintaan distribusi
// --------------------------
export const updatePermintaanDistribusi = async (data) => {
  const { pd_id, id_master_unit_tujuan, nomor_rm, nama_pasien, diagnosa } = data;

  const [result] = await pool.query(
    `UPDATE ls_permintaan_distribusi
     SET id_master_unit_tujuan = ?, nomor_rm = ?, nama_pasien = ?, diagnosa = ?, updated_at = NOW()
     WHERE pd_id = ? AND deleted_at IS NULL`,
    [id_master_unit_tujuan, nomor_rm, nama_pasien, diagnosa, pd_id]
  );

  return result.affectedRows > 0;
};

// --------------------------
// Soft delete header and related details
// --------------------------
export const deletePermintaanDistribusi = async (pd_id) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE ls_permintaan_distribusi SET deleted_at = NOW() WHERE pd_id = ?`,
      [pd_id]
    );
    await conn.query(
      `UPDATE dt_permintaan_distribusi_detail SET deleted_at = NOW() WHERE pd_id = ?`,
      [pd_id]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// --------------------------
// Edit detail item (e.g., qty_real or qty)
// --------------------------
export const editPermintaanDistribusiDetail = async (data) => {
  const { pdd_id, qty, qty_real } = data;
  const [result] = await pool.query(
    `UPDATE dt_permintaan_distribusi_detail
     SET qty = ?, qty_real = ?, updated_at = NOW()
     WHERE pdd_id = ? AND deleted_at IS NULL`,
    [qty, qty_real, pdd_id]
  );
  return result.affectedRows > 0;
};

// --------------------------
// Soft delete detail item
// --------------------------
export const deletePermintaanDistribusiDetail = async (pdd_id) => {
  const [result] = await pool.query(
    `UPDATE dt_permintaan_distribusi_detail
     SET deleted_at = NOW() WHERE pdd_id = ?`,
    [pdd_id]
  );
  return result.affectedRows > 0;
};
