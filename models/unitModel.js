import pool from "../config/db.js";

export const listAllUnit = async ({ page = 1, limit = 20, filters = {} } = {}) => {
    const offset = (page - 1) * limit;

    // build WHERE clauses dynamically
    let whereClauses = [];
    let params = [];

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