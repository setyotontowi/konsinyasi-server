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
    id_users
  } = data;

  await conn.query(
    `
    INSERT INTO ts_history_stok 
      (transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_users, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_users]
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

    const bulan = new Date(waktu_input).getMonth() + 1;

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
        stok_sebelum: stok.sisa,
        masuk: 0,
        keluar: 0,
        stok_sesudah: item.sisa,
        keterangan: `Stok opname detail #${insertedId}`,
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
