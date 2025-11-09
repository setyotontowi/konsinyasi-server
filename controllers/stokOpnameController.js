// controllers/stokOpnameController.js
import { createStokOpname } from "../models/stokOpnameModel.js";

export const createStokOpnameController = async (req, res) => {
  try {
    const id_users = req.user?.id || req.body.id_users; // if using auth middleware, fallback to body
    const data = req.body;

    // Basic validation
    if (!data.waktu_input || !data.id_master_unit) {
      return res.status(400).json({
        status: 400,
        message: "waktu_input dan id_master_unit harus diisi",
      });
    }

    const result = await createStokOpname(data, id_users);

    return res.status(201).json({
      status: 201,
      message: "Stok opname berhasil disimpan",
      data: result,
    });
  } catch (err) {
    console.error("Error in createStokOpnameController:", err);
    return res.status(500).json({
      status: 500,
      message: err.message || "Terjadi kesalahan saat menyimpan stok opname",
    });
  }
};
