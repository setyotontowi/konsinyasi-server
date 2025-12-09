import pool from "../config/db.js";
import { GROUP_VENDOR } from "../helpers/utilHelper.js";

export const insertUnit = async (userData) => {
  const { nama, keterangan, is_pbf, unit_id_simrs } = userData;
  const [result] = await pool.query(
    `INSERT INTO md_unit (nama, keterangan, is_pbf, unit_id_simrs)
     VALUES (?, ?, ?, ?)`,
    [nama, keterangan, is_pbf, unit_id_simrs]
  );
  return result.insertId;
};


export const getUnitById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM md_unit WHERE id = ?',
    [id]
  );
  return rows[0]; // return single user
};

export const listAllUnit = async ({ page = 1, limit = 20, filters = {}, user = {} } = {}) => {
    const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = [];
    let params = [];

    whereClauses.push('1=1');

    if (user.role === GROUP_VENDOR){
        whereClauses.push('un.id = ? OR is_pbf = "Tidak"');
        params.push(`${user.unit}`);
    }

    if (filters.id) {
        whereClauses.push('un.id = ?');
        params.push(`${filters.id}`);
    }

    if (filters.nama) {
        whereClauses.push('un.nama LIKE ?');
        params.push(`%${filters.nama}%`);
    }

    if (filters.is_pbf) {
        whereClauses.push('is_pbf = ?');
        params.push(filters.is_pbf);
    }


    const whereSQL = 'WHERE ' + whereClauses.join(' AND ');

    // get total count
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM md_unit un ${whereSQL}`, params);
    const total = countRows[0].total;
    
    // get data
    const [rows] = await pool.query(
        `SELECT 
            un.*
        FROM 
            md_unit un 
        ${whereSQL}
        ORDER BY 
            un.nama
        LIMIT ? OFFSET ? ;`
    , [...params, limit, offset]);

    return {
        rows,
        total
    };
}


export const changeUserUnit = async (userId, newUnitId) => {
  const [result] = await pool.query(
    'UPDATE md_users SET id_master_unit = ? WHERE id = ?',
    [newUnitId, userId]
  );
  return result.affectedRows; // 1 if success, 0 if user not found
};

export const changeUnit = async (idUnit, data) => {
  // Build dynamic SET clause
  const fields = [];
  const values = [];

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) return 0; // nothing to update

  values.push(idUnit); // for WHERE clause

  const [result] = await pool.query(
    `UPDATE md_unit SET ${fields.join(', ')} WHERE id = ?`,
    values
  );


  return result.affectedRows; // 1 if updated, 0 if unit not found
};

export const deleteUnitById = async (idUnit) => {
  const [result] = await pool.query(
    'DELETE FROM md_unit WHERE id = ?',
    [idUnit]
  );
  return result.affectedRows; // 1 if deleted, 0 if unit not found
}