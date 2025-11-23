import pool from "../config/db.js";

// ----------------------
//  USED ITEMS LIST
// ----------------------
export const listUsedbarang = async ({ page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(`
        SELECT mu.nama as nama_unit, mu2.nama, hpd.*, COUNT(dpdd.pdd_id) as jumlah
        FROM hd_permintaan_distribusi hpd 
        JOIN dt_permintaan_distribusi_detail dpdd ON (dpdd.pd_id = hpd.pd_id)
        JOIN ts_distribusi td ON td.id_permintaan_distribusi = hpd.pd_id 
        JOIN md_barang mb ON dpdd.id_master_barang = mb.barang_id 
        JOIN md_unit mu ON hpd.id_master_unit_tujuan = mu.id 
        JOIN md_users mu2 ON hpd.id_users = mu2.id 
        WHERE qty_real IS NOT NULL AND hpd.deleted_at IS NULL
    `);

    const [rows] = await pool.query(`
        SELECT mu.nama as nama_unit, mu2.nama, hpd.*, COUNT(dpdd.pdd_id) as jumlah, td.waktu_kirim, dpdd.waktu_input, mb.barang_hpp
        FROM hd_permintaan_distribusi hpd 
        JOIN dt_permintaan_distribusi_detail dpdd ON (dpdd.pd_id = hpd.pd_id)
        JOIN ts_distribusi td ON td.id_permintaan_distribusi = hpd.pd_id 
        JOIN md_barang mb ON dpdd.id_master_barang = mb.barang_id 
        JOIN md_unit mu ON hpd.id_master_unit_tujuan = mu.id 
        JOIN md_users mu2 ON hpd.id_users = mu2.id 
        WHERE qty_real IS NOT NULL AND hpd.deleted_at IS NULL
        GROUP BY dpdd.pd_id
        LIMIT ? OFFSET ?
    `, [limit, offset]);

    return { rows, total: countRows[0].total };
};


// ----------------------
//  LIST PURCHASE ORDERS
// ----------------------
export const listPurchaseOrders = async ({ page = 1, limit = 20, filters }) => {
    const offset = (page - 1) * limit;

    let where = `hpo.deleted_at IS NULL`;
    const params = [];

    // ------------------------------------
    // Helper: Apply dynamic date ranges
    // ------------------------------------
    const applyDateRange = (field, range) => {
        if (!range) return;

        const start = range.start || null;
        const end   = range.end   || null;

        // start only → start to today
        if (start && !end) {
            where += ` AND ${field} BETWEEN ? AND ?`;
            params.push(start, new Date().toISOString().slice(0, 10));
        }
        // end only → beginning of time to end
        else if (!start && end) {
            where += ` AND ${field} BETWEEN ? AND ?`;
            params.push("1970-01-01", end);
        }
        // both → normal
        else if (start && end) {
            where += ` AND ${field} BETWEEN ? AND ?`;
            params.push(start, end);
        }
    };

    // ------------------------------------
    // Apply date filters
    // ------------------------------------
    applyDateRange("hpo.tanggal", filters?.range_tanggal);
    applyDateRange("hpo.tanggal_datang", filters?.range_tanggal_datang);
    applyDateRange("hpo.tanggal_entri", filters?.range_tanggal_entri);

    // ------------------------------------
    // Other optional filters
    // ------------------------------------
    if (filters?.id_master_unit_supplier) {
        where += ` AND hpo.id_master_unit_supplier = ?`;
        params.push(filters.id_master_unit_supplier);
    }

    if (filters?.cetak) {
        where += ` AND hpo.cetak = ?`;
        params.push(filters.cetak);
    }

    // ------------------------------------
    // Count
    // ------------------------------------
    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total 
         FROM hd_purchase_order hpo
         WHERE ${where}`,
        params
    );

    const total = countRows[0].total;

    // ------------------------------------
    // Rows
    // ------------------------------------
    const [rows] = await pool.query(
        `SELECT hpo.*
         FROM hd_purchase_order hpo
         WHERE ${where}
         ORDER BY hpo.tanggal DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    );

    return { rows, total };
};



// ----------------------
//  CREATE PURCHASE ORDER
// ----------------------
export const createPurchaseOrder = async (header, details) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [headerResult] = await conn.query(`
            INSERT INTO hd_purchase_order (
                tanggal, tanggal_datang, tanggal_entri, id_users,
                ppn, subtotal, id_master_unit_supplier, cetak
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'belum')
        `, [
            header.tanggal,
            header.tanggal_datang,
            header.tanggal_entri,
            header.id_users,
            header.ppn,
            header.subtotal,
            header.id_master_unit_supplier
        ]);

        const id_po = headerResult.insertId;

        for (const d of details) {
            await conn.query(`
                INSERT INTO dt_purchase_order_detail (
                    id_po, id_barang, permintaan, harga_satuan, id_permintaan_pemesanan_detail
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                id_po,
                d.id_barang,
                d.permintaan,
                d.harga_satuan,
                d.id_permintaan_pemesanan_detail
            ]);
        }

        await conn.commit();
        return id_po;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};


// ----------------------
//  UPDATE HEADER
// ----------------------
export const updatePurchaseOrder = async (id, header) => {
    const fields = [];
    const params = [];

    for (const key of Object.keys(header)) {
        fields.push(`${key} = ?`);
        params.push(header[key]);
    }

    params.push(id);

    await pool.query(`
        UPDATE hd_purchase_order SET ${fields.join(", ")} WHERE id_po = ?
    `, params);

    return true;
};


// ----------------------
//  SOFT DELETE
// ----------------------
export const deletePurchaseOrder = async (id) => {
    await pool.query(`
        UPDATE hd_purchase_order 
        SET deleted_at = NOW() 
        WHERE id_po = ?
    `, [id]);
    return true;
};
