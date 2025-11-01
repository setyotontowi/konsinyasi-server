import pool from "../config/db.js";


// Satuan
export const getAllSatuan = async ({ page = 1, limit = 20, filters = {} } = {}) => {
const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = [];
    let params = [];

    if (filters.nama) {
        whereClauses.push('mst_nama LIKE ?');
        params.push(`%${filters.nama}%`);
    }

    const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM md_satuan un ${whereSQL}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(`SELECT * FROM md_satuan ${whereSQL} ORDER BY mst_id DESC`, params);
    return { rows, total };
};

export const getSatuanById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM md_satuan WHERE mst_id = ?", [id]);
    return rows[0];
};

export const createSatuan = async (data) => {
    const { nama } = data;
    const [result] = await pool.query(
        "INSERT INTO md_satuan (mst_nama) VALUES (?)",
        [nama]
    );
    return { mst_id: result.insertId, nama };
};

export const updateSatuan = async (id, data) => {
    const { nama } = data;
    const [result] = await pool.query(
        "UPDATE md_satuan SET mst_nama = ?, updated_at = NOW() WHERE mst_id = ?",
        [nama, id]
    );
    return result.affectedRows > 0;
};

export const deleteSatuan = async (id) => {
    const [result] = await pool.query("DELETE FROM md_satuan WHERE mst_id = ?", [id]);
    return result.affectedRows > 0;
};


// Barang