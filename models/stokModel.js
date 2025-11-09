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
        sisa : barang[0]?.sisa || 0
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};