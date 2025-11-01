import pool from "../config/db.js";

export const insertUnit = async (userData) => {
  const { nama, keterangan, is_pbf } = userData;
  const [result] = await pool.query(
    `INSERT INTO md_unit (nama, keterangan, is_pbf)
     VALUES (?, ?, ?)`,
    [nama, keterangan, is_pbf]
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

export const listAllUnit = async ({ page = 1, limit = 20, filters = {} } = {}) => {
    const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = [];
    let params = [];

    if (filters.id) {
        whereClauses.push('un.id = ?');
        params.push(`%${filters.id}%`);
    }

    if (filters.nama) {
        whereClauses.push('un.nama LIKE ?');
        params.push(`%${filters.nama}%`);
    }

    if (filters.is_pbf) {
        whereClauses.push('is_pbf = ?');
        params.push(filters.is_pbf);
    }


    const whereSQL = 'WHERE un.is_active = 1 AND ' + whereClauses.join(' AND ');

    // get total count
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM md_unit un ${whereSQL}`, params);
    const total = countRows[0].total;
    
    // get data
    const [rows] = await pool.query(
        `SELECT 
            un.*,
            COUNT(u.id) AS user_count
        FROM 
            md_unit un
        LEFT JOIN 
            md_users u 
            ON u.id_master_unit = un.id 
        ${whereSQL}
        GROUP BY 
            un.id, un.nama
        ORDER BY 
            un.nama;`
    , params);

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