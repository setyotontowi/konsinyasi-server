import pool from "../config/db.js";


// Satuan
export const getAllSatuan = async ({ page = 1, limit = 20, filters = {} } = {}) => {
const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = ["deleted_at IS NULL"];
    let params = [];

    if (filters.nama) {
        whereClauses.push('mst_nama LIKE ?');
        params.push(`%${filters.nama}%`);
    }``

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`;

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
    const { mst_nama } = data;
    const [result] = await pool.query(
        "INSERT INTO md_satuan (mst_nama) VALUES (?)",
        [mst_nama]
    );
    return { mst_id: result.insertId, mst_nama };
};

export const updateSatuan = async (id, data) => {
    const { mst_nama } = data;
    const [result] = await pool.query(
        "UPDATE md_satuan SET mst_nama = ?, updated_at = NOW() WHERE mst_id = ?",
        [mst_nama, id]
    );
    return result.affectedRows > 0;
};

export const deleteSatuan = async (id) => {
    const [result] = await pool.query("UPDATE md_satuan SET deleted_at = NOW()WHERE mst_id = ?", [id]);
    return result.affectedRows > 0;
};


// Barang
export const getAllBarang = async ({ page = 1, limit = 20, filters = {} } = {}) => {
const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = ["md_barang.deleted_at IS NULL"];
    let params = [];

    if (filters.nama) {
        whereClauses.push('(barang_nama LIKE ? OR serial_number LIKE ?)');
        params.push(`%${filters.nama}%`, `%${filters.nama}%`);
    }
    if (filters.satuan) {
        whereClauses.push('md_barang.id_satuan_kecil = ?');
        params.push(`${filters.satuan}`);
    }
    if (filters.nama_pabrik) {
        whereClauses.push('md_barang.id_pabrik = ?');
        params.push(`${filters.nama_pabrik}`);
    }

    const whereSQL = `WHERE ${whereClauses.join(" AND ")}`; 

    const [countRows] = await pool.query(`SELECT COUNT(*) as total 
        FROM md_barang
        JOIN md_satuan ON md_barang.id_satuan_kecil = md_satuan.mst_id
        JOIN md_unit ON md_barang.id_pabrik = md_unit.id ${whereSQL}`, params);
    const total = countRows[0].total;

    console.log(whereSQL, params);

    const [rows] = await pool.query(`SELECT md_barang.*, md_satuan.mst_nama as nama_satuan, md_unit.nama as nama_pabrik FROM 
        md_barang
        JOIN md_satuan ON md_barang.id_satuan_kecil = md_satuan.mst_id
        JOIN md_unit ON md_barang.id_pabrik = md_unit.id
        ${whereSQL} ORDER BY barang_id DESC`, params);

    return { rows, total };
};

export const getBarangById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM md_barang WHERE barang_id = ?", [id]);
    return rows[0];
};

export const createBarang = async (data) => {
    const [result] = await pool.query(
        "INSERT INTO md_barang (barang_nama, serial_number, id_pabrik, id_satuan_kecil, barang_hpp, barang_id_simrs) VALUES (?, ?, ?, ?, ?, ?)",
        [data.barang_nama, data.serial_number, data.id_pabrik, data.id_satuan_kecil, data.barang_hpp, data.barang_id_simrs]
    );
    return { mst_id: result.insertId, nama: data.barang_nama, result:result };
};

export const updateBarang = async (id, data) => {
    const fields = [];
    const values = [];

    for (const key in data) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
    }

    if (fields.length === 0) return 0; // nothing to update

    values.push(id); // for WHERE clause

    const [result] = await pool.query(
        `UPDATE md_barang SET ${fields.join(', ')} WHERE barang_id = ?`,
        values
    );
    return result.affectedRows > 0;
};

export const deleteBarang = async (id) => {
    const [result] = await pool.query("UPDATE md_barang SET deleted_at = NOW() WHERE barang_id = ?", [id]);
    return result.affectedRows > 0;
};