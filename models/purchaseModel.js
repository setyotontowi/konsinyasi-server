import pool from "../config/db.js";

// ----------------------
//  USED ITEMS LIST
// ----------------------
export const listUsedbarang = async ({ page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(`
        SELECT COUNT(DISTINCT hpd.pd_id) AS total
        FROM hd_permintaan_distribusi hpd 
        LEFT JOIN dt_purchase_order_detail dpo 
            ON dpo.id_permintaan_distribusi = hpd.pd_id
        JOIN dt_permintaan_distribusi_detail dpdd 
            ON dpdd.pd_id = hpd.pd_id
        JOIN ts_distribusi td 
            ON td.id_permintaan_distribusi = hpd.pd_id 
        JOIN md_barang mb 
            ON dpdd.id_master_barang = mb.barang_id 
        JOIN md_unit mu 
            ON hpd.id_master_unit_tujuan = mu.id 
        JOIN md_users mu2 
            ON hpd.id_users = mu2.id 
        WHERE dpdd.qty_real IS NOT NULL
        AND hpd.deleted_at IS NULL
        AND dpo.id IS NULL;
    `);

    const [rows] = await pool.query(`
        SELECT 
            mu.nama AS nama_unit, 
            mu2.nama, 
            hpd.*, 
            COUNT(dpdd.pdd_id) AS jumlah, 
            td.waktu_kirim,  
            dpdd.waktu_input,
            mb.barang_hpp
        FROM hd_permintaan_distribusi hpd 
        LEFT JOIN dt_purchase_order_detail dpo 
            ON dpo.id_permintaan_distribusi = hpd.pd_id
        JOIN dt_permintaan_distribusi_detail dpdd 
            ON dpdd.pd_id = hpd.pd_id
        JOIN ts_distribusi td 
            ON td.id_permintaan_distribusi = hpd.pd_id 
        JOIN md_barang mb 
            ON dpdd.id_master_barang = mb.barang_id 
        JOIN md_unit mu 
            ON hpd.id_master_unit_tujuan = mu.id 
        JOIN md_users mu2 
            ON hpd.id_users = mu2.id 
        WHERE dpdd.qty_real IS NOT NULL
        AND hpd.deleted_at IS NULL
        AND dpo.id IS NULL
        GROUP BY dpdd.pd_id
        LIMIT ? OFFSET ?;
    `, [limit, offset]);

    return { rows, total: countRows[0].total };
};

// ----------------------
//  USED ITEMS LIST BULK
// ----------------------

export const listUsedBarangBulk = async (id_unit) => {
  try {
    if (!id_unit) {
      throw new Error("id_unit (PBF) is required");
    }

    // 1) Fetch grouped result
    const [rows] = await pool.query(
      `
      SELECT 
        nama_barang, 
        SUM(qty) AS qty,
        MIN(waktu_kirim) AS waktu_from,
        MAX(waktu_kirim) AS waktu_to,
        nama_satuan,
        barang_hpp
      FROM (
        SELECT 
          dpdd.pdd_id,
          dpdd.pd_id,
          dpdd.id_master_barang,
          mb.barang_nama AS nama_barang,
          dpdd.qty_real AS qty,
          mb.barang_hpp AS barang_hpp,
          td.waktu_kirim,
          hpd.id_master_unit_tujuan AS id_pbf,
          ms.mst_nama AS nama_satuan
        FROM dt_permintaan_distribusi_detail dpdd
        JOIN hd_permintaan_distribusi hpd 
            ON hpd.pd_id = dpdd.pd_id
        JOIN ts_distribusi td
            ON td.id_permintaan_distribusi = hpd.pd_id
        JOIN md_barang mb 
            ON dpdd.id_master_barang = mb.barang_id
        JOIN md_satuan ms 
            ON mb.id_satuan_kecil = ms.mst_id
        JOIN md_unit mu
            ON hpd.id_master_unit_tujuan = mu.id
        LEFT JOIN dt_purchase_order_detail dpo
            ON dpo.id_permintaan_distribusi = hpd.pd_id
        WHERE dpdd.qty_real IS NOT NULL
          AND hpd.deleted_at IS NULL
          AND hpd.id_master_unit_tujuan = ?
          AND dpo.id IS NULL
      ) AS tbl
      GROUP BY id_master_barang
      `,
      [id_unit]
    );

    // 2) Compute global min & max in JS
    let min_time = null;
    let max_time = null;

    for (const row of rows) {
      const from = new Date(row.waktu_from);
      const to = new Date(row.waktu_to);

      if (!min_time || from < min_time) min_time = from;
      if (!max_time || to > max_time) max_time = to;
    }

    return {
      success: true,
      rows,
      min_time,
      max_time,
    };

  } catch (err) {
    console.error("ERROR listUsedBarangBulk:", err);
    throw err;
  }
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

        console.log(header);
        console.log(details);

        const [headerResult] = await conn.query(`
            INSERT INTO hd_purchase_order (
                tanggal_datang, tanggal_entri, id_users,
                ppn, subtotal, id_master_unit_supplier, cetak, id_permintaan_distribusi
            )
            VALUES (?, ?, ?, ?, ?, ?, 'belum', ?)
        `, [
            header.tanggal_datang,
            header.tanggal_entri,
            header.id_users,
            header.ppn,
            header.subtotal,
            header.id_master_unit_tujuan,
            header.id_permintaan_distribusi
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

export const savePurchaseOrderPrintPath = async (id, printPath) => {
    await pool.query(
        `UPDATE hd_purchase_order SET print_path = ?, cetak = 'sudah' WHERE id = ?`,
        [printPath, id]
    );
    return true;
};

export const confirmPurchaseOrder = async (id) => {
    await pool.query(
        `
        UPDATE hd_purchase_order
        SET vendor_confirmation_at = NOW()
        WHERE id = ?
        `,
        [id]
    );
    return true;
};