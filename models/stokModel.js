import pool from "../config/db.js";
import { toNumber } from "../helpers/utilHelper.js";

export const calculateStok = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {id_barang, ed, nobatch} = data

    console.log("calculate stok data", data);

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
    id, // this is the source id you want to store
    id_users,
    id_master_unit,
  } = data;

  console.log("Insert record", data)

  // Prepare dynamic columns
  let id_stok_opname_detail = null;
  let id_penerimaan_distribusi = null;

  if (transaksi === "stok opname") {
    id_stok_opname_detail = id;
  } else if (transaksi === "penerimaan") {
    id_penerimaan_distribusi = id;
  }

  await conn.query(
    `
    INSERT INTO ts_history_stok 
      (transaksi, id_barang, ed, nobatch, masuk, keluar, stok_sebelum, stok_sesudah, keterangan, 
       id_stok_opname_detail, id_penerimaan_distribusi, id_users, id_unit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      transaksi,
      id_barang,
      ed,
      nobatch,
      masuk,
      keluar,
      stok_sebelum,
      stok_sesudah,
      keterangan,
      id_stok_opname_detail,
      id_penerimaan_distribusi,
      id_users,
      id_master_unit,
    ]
  );

  await stokLive(conn, data);
};

export const insertNewTransaction = async (conn, data) => {
  const {
    id_master_barang,
    tipe,
    id,
    masuk = 0,
    keluar = 0,
    id_users,
    id_master_unit
  } = data;

  console.log("Insert new transaction", data)

  // Get candidate stok (FIFO: earliest ED)
  const rows = await conn.query(
    `SELECT * FROM ch_stok_live 
     WHERE id_barang = ?
     ORDER BY ed ASC`,
    [id_master_barang]
  );

  // rows = [ [resultRows], fields ]
  const list = rows && rows[0] ? rows[0] : [];
  const datacandidate = list.length > 0 ? list[0] : null;

  if (!datacandidate) {
    throw new Error(`stok barang tidak ada`);
  }

  let stokData = { ...datacandidate }; // clone to avoid mutation bugs


  stokData = {
    ...stokData,
    id_barang: id_master_barang,
    id_users,
    id_unit: id_master_unit,
    masuk,
    keluar,
    stok_sebelum: datacandidate.sisa, 
    stok_sesudah: datacandidate.sisa + masuk - keluar
  };

  if (tipe === "pemakaian") {
    stokData.transaksi = "pemakaian";
    stokData.id_penerimaan_distribusi = id;
  }


  // If invalid, recalc stok
  if (!stokData.is_valid) {
    const stokReal = await calculateStok({
      id_barang: stokData.id_barang,
      ed: stokData.ed,
      nobatch: stokData.nobatch
    });

    stokData.stok_sebelum = stokReal.sisa
    stokData.stok_sesudah = stokReal.sisa + masuk - keluar
  }

  // Sanitize data so insertRecord gets ONLY required fields.
  const cleanRecord = {
    transaksi: stokData.transaksi,
    id_barang: stokData.id_barang,
    ed: stokData.ed,
    nobatch: stokData.nobatch,
    masuk: stokData.masuk,
    keluar: stokData.keluar,
    stok_sebelum: stokData.stok_sebelum,
    stok_sesudah: stokData.stok_sesudah,
    keterangan: stokData.keterangan || "",
    id: id, // this will be checked inside insertRecord
    id_users,
    id_master_unit
  };

  await insertRecord(conn, cleanRecord);
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

  console.log("currentData", currentData);

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
    const stokLiveSisa = toNumber(stokLive.sisa) + masuk - keluar; 
    console.log("stok live sisa", stokLiveSisa, masuk, keluar);
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


export const getAllHistoryStok = async ({ page = 1, limit = 20, filters = {}, user = {} }) => {
  const offset = (page - 1) * limit;
  let { id_barang, ed, nobatch, start_date, end_date } = filters;

  if (ed) {
      ed = new Date(ed)
        .toISOString()
        .slice(0, 19) // remove 'Z'
        .replace('T', ' ');
    }

  let baseQuery = `
    FROM ts_history_stok h
    JOIN md_barang b ON h.id_barang = b.barang_id
    WHERE 1=1
  `;
  const params = [];

  if (id_barang) {
    baseQuery += ` AND h.id_barang = ?`;
    params.push(id_barang);
  }

  if (ed) {
    baseQuery += ` AND h.ed = ?`;
    params.push(ed);
  }

  if (nobatch) {
    baseQuery += ` AND h.nobatch = ?`;
    params.push(nobatch);
  }

 if (start_date && end_date) {
    baseQuery += ` AND DATE(h.created_at) BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  } else if (start_date) {
    baseQuery += ` AND DATE(h.created_at) >= ?`;
    params.push(start_date);
  } else if (end_date) {
    baseQuery += ` AND DATE(h.created_at) <= ?`;
    params.push(end_date);
  }

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${baseQuery}`, params);
  const total = countRows[0]?.total || 0;

  const [rows] = await pool.query(
    `
    SELECT
      h.id,
      h.transaksi,
      h.id_barang,
      h.ed,
      h.nobatch,
      h.masuk,
      h.keluar,
      h.stok_sebelum,
      h.stok_sesudah,
      h.keterangan,
      h.id_stok_opname_detail,
      h.id_users,
      h.id_unit,
      b.barang_nama as nama_barang,
      h.created_at
    ${baseQuery}
    ORDER BY h.created_at DESC, id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
    },
  };
};


export const getStokLive = async ({ page = 1, limit = 20, filters = {} }) => {
  const offset = (page - 1) * limit;

  // Extract filters
  const { id_barang, ed, nobatch, unit } = filters;

  // Build dynamic WHERE clause
  let where = "WHERE 1=1";
  const params = [];

  if (id_barang) {
    where += " AND ch_stok_live.id_barang = ?";
    params.push(id_barang);
  }

  if (ed) {
    where += " AND DATE(ch_stok_live.ed) = ?";
    params.push(ed);
  }

  if (nobatch) {
    where += " AND ch_stok_live.nobatch = ?";
    params.push(nobatch);
  }

  if (unit) {
    where += " AND md_barang.id_pabrik = ?";
    params.push(unit);
  }

  // Count with filter
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total 
     FROM ch_stok_live
     JOIN md_barang ON ch_stok_live.id_barang = md_barang.barang_id
     ${where}`,
    params
  );

  const total = countRows[0]?.total || 0;

  // Paginated data with filter
  const [rows] = await pool.query(
    `SELECT ch_stok_live.*, md_barang.barang_nama, md_barang.id_pabrik
     FROM ch_stok_live
     JOIN md_barang ON ch_stok_live.id_barang = md_barang.barang_id
     ${where}
     ORDER BY sisa ASC, updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
    },
  };
};
