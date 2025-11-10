import pool from "../config/db.js";
import { calculateStok } from "./stokModel.js";

// Helper: insert a stock journal record
export const insertRecord = async (conn, data) => {
  const {
    transaksi,
    id_barang,
    ed,
    nobatch,
    masuk = 0,
    keluar = 0,
    stok_sebelum = 0,
    stok_sesudah = 0,
    keterangan = "",
    id_stok_opname_detail,
    id_users
  } = data;

  await conn.query(
    `
    INSERT INTO ts_history_stok 
      (transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_stok_opname_detail, id_users, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_stok_opname_detail, id_users]
  );
};

export const createStokOpname = async (data, id_users) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { waktu_input, id_master_unit, items } = data;

    // Validation
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Item harus diisi");
    }

    items.forEach((item, index) => {
      if (!item.id_master_barang)
        throw new Error(`Missing required field: id_master_barang (item #${index + 1})`);
      if (!item.nobatch)
        throw new Error(`Missing required field: nobatch (item #${index + 1})`);
      if (!item.ed)
        throw new Error(`Missing required field: ed (item #${index + 1})`);
      if (item.sisa == null)
        throw new Error(`Missing required field: sisa (item #${index + 1})`);
      if (!id_users)
        throw new Error(`Missing required field: id_users`);
    });

    const bulan = waktu_input.split(' ')[0];

    // Part 1: Insert header record
    const [headerResult] = await conn.query(
      `INSERT INTO hd_stok_opname (waktu_input, bulan, id_master_unit, id_users)
       VALUES (?, ?, ?, ?)`,
      [waktu_input, bulan, id_master_unit, id_users]
    );

    const so_id = headerResult.insertId;

    // Part 2: Loop through each item sequentially
    for (const item of items) {
      // Insert detail record first
      const [result] = await conn.query(
        `
        INSERT INTO dt_stok_opname_detail
          (id_stok_opname, id_master_barang, nobatch, ed, hpp,
           kondisi_barang, keterangan, awal, masuk, keluar, sisa, id_users, id_master_unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          so_id,
          item.id_master_barang,
          item.nobatch,
          item.ed,
          item.hpp,
          item.kondisi_barang,
          item.keterangan,
          item.awal,
          item.masuk,
          item.keluar,
          item.sisa,
          id_users,
          id_master_unit
        ]
      );

      const insertedId = result.insertId;

      // Calculate stok before opname
      const stok = await calculateStok({
        id_barang: item.id_master_barang,
        ed: item.ed,
        nobatch: item.nobatch
      });

      console.log(stok);

      const selisih = stok.sisa - item.sisa;

      // 1️⃣ If selisih exists, insert penyeimbang
      if (selisih > 0) {
        // stok lebih besar → perlu keluar
        const penyeimbang = {
          id_barang: item.id_master_barang,
          ed: item.ed,
          nobatch: item.nobatch,
          transaksi: 'Stok Opname',
          stok_sebelum: stok.sisa,
          masuk: 0,
          keluar: selisih,
          stok_sesudah: item.sisa,
          keterangan: "Penyeimbang stok (selisih positif)",
          id_users
        };
        await insertRecord(conn, penyeimbang);
      } else if (selisih < 0) {
        // stok lebih kecil → perlu masuk
        const penyeimbang = {
          id_barang: item.id_master_barang,
          ed: item.ed,
          nobatch: item.nobatch,
          transaksi: 'Stok Opname',
          stok_sebelum:stok.sisa,
          masuk: Math.abs(selisih),
          keluar: 0,
          stok_sesudah: item.sisa,
          keterangan: "Penyeimbang stok (selisih negatif)",
          id_users
        };
        await insertRecord(conn, penyeimbang);
      }

      // 2️⃣ Insert actual opname record
      const actualData = {
        id_barang: item.id_master_barang,
        ed: item.ed,
        transaksi: 'Stok Opname',
        nobatch: item.nobatch,
        stok_sebelum: item.sisa,
        masuk: 0,
        keluar: 0,
        stok_sesudah: item.sisa,
        keterangan: `Stok opname detail #${insertedId}`,
        id_stok_opname_detail: insertedId,
        id_users
      };
      await insertRecord(conn, actualData);
    }

    await conn.commit();
    return { success: true, so_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


export const getAllStokOpname = async ({ 
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
    where += " AND hd.waktu_input BETWEEN ? AND ?";
    params.push(filters.start, filters.end);
  }
  
  const [rows] = await pool.query(
    `SELECT hd.*, ua.nama as nama_unit, us.nama as nama_user, COUNT(sod.id) as jumlah_barang
    FROM hd_stok_opname hd 
    JOIN md_unit ua ON (hd.id_master_unit = ua.id)
    JOIN md_users us ON (hd.id_users = us.id)
    JOIN dt_stok_opname_detail sod ON (sod.id_stok_opname = hd.id)
    ${where} 
    GROUP BY hd.id
    ORDER BY waktu_input DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total 
    FROM hd_stok_opname hd
     ${where}`,
    params
  );

  return {
    data: rows,
    pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
};


export const getStokOpnameById = async (id) => {
  // --- Header ---
  const [headerRows] = await pool.query(
    `
    SELECT hd.*, ua.nama AS nama_unit, us.nama AS nama_user
    FROM hd_stok_opname hd
    JOIN md_unit ua ON hd.id_master_unit = ua.id
    JOIN md_users us ON hd.id_users = us.id
    WHERE hd.id = ? AND hd.deleted_at IS NULL
    `,
    [id]
  );

  if (headerRows.length === 0) {
    throw new Error("Stok opname tidak ditemukan");
  }

  const header = headerRows[0];

  // --- Detail ---
  const [details] = await pool.query(
    `
    SELECT 
      d.*,
      d.sisa AS kenyataan,
      mb.barang_nama AS nama_barang,
      -- editable = false if any later transaction exists in ts_history_stok
      (
        SELECT 
          CASE 
            WHEN COUNT(*) > 0 THEN FALSE
            ELSE TRUE
          END
        FROM ts_history_stok hs
        WHERE hs.id_barang = d.id_master_barang
        AND hs.ed = d.ed
        AND hs.nobatch = hs.nobatch
        AND hs.created_at > hd.created_at
        AND hs.transaksi != "Stok Opname"
      ) AS editable
    FROM dt_stok_opname_detail d
    JOIN md_barang mb ON d.id_master_barang = mb.barang_id
    JOIN hd_stok_opname hd ON d.id_stok_opname = hd.id
    WHERE d.id_stok_opname = ? AND d.deleted_at IS NULL
    ORDER BY mb.barang_nama ASC
    `,
    [id]
  );

  return {
    ...header,
    details,
  };
};

// ✅ Get distinct ED list for a specific barang
export const getDistinctEDsByBarang = async (id_barang) => {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT ed
    FROM ts_history_stok
    WHERE id_barang = ?
      AND ed IS NOT NULL
    ORDER BY ed ASC
    `,
    [id_barang]
  );

  return rows;
};


// ✅ Get distinct NoBatch list for a specific barang + ED
export const getDistinctNoBatchByBarangAndEd = async (id_barang, ed) => {
  const [rows] = await pool.query(
    `
    SELECT DISTINCT nobatch
    FROM ts_history_stok
    WHERE id_barang = ? 
      AND ed = DATE(?)
      AND nobatch IS NOT NULL
    ORDER BY nobatch ASC
    `,
    [id_barang, ed]
  );

  return rows;
};

