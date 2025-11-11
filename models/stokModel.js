import e from "cors";
import pool from "../config/db.js";

export const calculateStok = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {id_barang, ed, nobatch} = data

    const missing = [];
    if (!id_barang) missing.push("id_barang");
    if (!ed) missing.push("ed");
    if (!nobatch) missing.push("nobatch");

    if (missing.length > 0) {
        throw new Error(`Field(s) harus diisi: ${missing.join(", ")}`);
    }

    const where = " WHERE id_barang = ? AND ed = ? AND nobatch = ?";
    const params = [id_barang, ed, nobatch];

    // Calculate keluar masuk per barang
    const [barang] = await conn.query(
        `
        SELECT id_barang, ed, nobatch, 
        SUM(masuk) as masuk, SUM(keluar) as keluar, 
        SUM(masuk-keluar) as sisa 
        FROM ts_history_stok
        ${where}
        GROUP BY id_barang, ed, nobatch
        `, 
        [...params]
    )

    await conn.commit();
    return { 
        id_barang, 
        ed,
        nobatch,
        masuk : barang[0]?.masuk || 0,
        keluar : barang[0]?.keluar || 0,
        sisa : barang[0]?.sisa || 0,
        baru : barang.length > 0? 0 : 1,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

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
    id_users,
    id_master_unit,
    baru,
  } = data;

  await conn.query(
    `
    INSERT INTO ts_history_stok 
      (transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_stok_opname_detail, id_users, id_unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, id_stok_opname_detail, id_users, id_master_unit]
  );

  stokLive(conn, data);
};

export const stokLive = async (conn, data) => {
  const {
    id_barang,
    ed,
    nobatch,
    masuk = 0,
    keluar = 0,
    stok_sesudah = 0,
    baru
  } = data;

  const [currentData] = await conn.query(
    `SELECT * FROM ch_stok_live WHERE id_barang = ? AND ed = ? AND nobatch = ?`,
    [id_barang, ed, nobatch]
  );

  if (baru && (!currentData || currentData.length === 0)) {
    await conn.query(
      `
      INSERT INTO ch_stok_live (id_barang, ed, nobatch, sisa, is_sync, is_valid)
      VALUES (?, ?, ?, ?, 1, 1)
      `,
      [id_barang, ed, nobatch, stok_sesudah]
    );
    return;
  }

  if (currentData && currentData.length > 0) {
    const stokLive = currentData[0];
    const stokLiveSisa = stokLive.sisa + masuk - keluar; 
    const is_valid = stokLiveSisa === stok_sesudah ? 1 : 0;

    await conn.query(
      `
      UPDATE ch_stok_live
      SET sisa = ?, is_valid = ?
      WHERE id_barang = ? AND ed = ? AND nobatch = ?
      `,
      [stokLiveSisa, is_valid, id_barang, ed, nobatch]
    );
  }
  
}