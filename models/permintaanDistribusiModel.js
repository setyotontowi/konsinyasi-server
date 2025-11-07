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
      `INSERT INTO hd_permintaan_distribusi 
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

  let where = "WHERE hd.deleted_at IS NULL";
  const params = [];

  // 🔹 Restrict non-admin users
  if (user.role !== 1 && user.id_master_unit) {
    where += " AND hd.id_master_unit = ?";
    params.push(user.id_master_unit);
  }

  // 🔹 Additional filters
  if (filters.start && filters.end) {
    where += " AND hd.waktu BETWEEN ? AND ?";
    params.push(filters.start, filters.end);
  }

  if (filters.id_master_unit_tujuan) {
    where += " AND hd.id_master_unit_tujuan = ?";
    params.push(filters.id_master_unit_tujuan);
  }

  if (filters.search) {
    where += " AND (hd.nama_pasien LIKE ? OR hd.nomor_rm LIKE ?)";
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [rows] = await pool.query(
    `SELECT hd.*, ua.nama as unit_asal, ut.nama as unit_tujuan FROM hd_permintaan_distribusi hd 
    JOIN md_unit ut ON (hd.id_master_unit_tujuan = ut.id)
    JOIN md_unit ua ON (hd.id_master_unit = ua.id)
    ${where} 
    ORDER BY waktu DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM hd_permintaan_distribusi hd ${where}`,
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
    `SELECT * FROM hd_permintaan_distribusi WHERE pd_id = ? AND deleted_at IS NULL`,
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
  const { pd_id, ...fieldsToUpdate } = data;

  const fields = [];
  const values = [];

  // Optional whitelist for safety
  const allowedFields = [
    "id_master_unit_tujuan",
    "nomor_rm",
    "nama_pasien",
    "diagnosa"
  ];

  for (const key in fieldsToUpdate) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(fieldsToUpdate[key]);
    }
  }

  if (fields.length === 0) return false; // nothing to update

  // Always update timestamp
  fields.push("updated_at = NOW()");

  values.push(pd_id);

  const [result] = await pool.query(
    `UPDATE hd_permintaan_distribusi 
     SET ${fields.join(", ")} 
     WHERE pd_id = ? AND deleted_at IS NULL`,
    values
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
      `UPDATE hd_permintaan_distribusi SET deleted_at = NOW() WHERE pd_id = ?`,
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
  const { pdd_id, ...fieldsToUpdate } = data;

  const fields = [];
  const values = [];

  // Optional whitelist for safety
  const allowedFields = ["id_master_satuan", "qty", "qty_real"];

  for (const key in fieldsToUpdate) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(fieldsToUpdate[key]);
    }
  }

  if (fields.length === 0) return false; // nothing to update

  // Always update timestamp
  fields.push("updated_at = NOW()");

  values.push(pdd_id);

  const [result] = await pool.query(
    `UPDATE dt_permintaan_distribusi_detail 
     SET ${fields.join(", ")} 
     WHERE pdd_id = ? AND deleted_at IS NULL`,
    values
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
