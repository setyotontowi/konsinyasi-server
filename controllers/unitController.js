import { insertUnit, listAllUnit, getUnitById, changeUserUnit, changeUnit } from "../models/unitModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";

export const createUnit = async (req, res) => {
  const { nama, keterangan, is_pbf } = req.body;

  try {
    // insert into database
    const unitId = await insertUnit({
      nama,
      keterangan,
      is_pbf
    });

    sendResponse(res, unitId, 'Unit created successfully');    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllUnit = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    const filters = {
        id : req.query.id || undefined,
        nama: req.query.nama || undefined,
        is_pbf: req.query.is_pbf || undefined
    };

    const { rows, total } = await listAllUnit({ page, limit, filters });
    sendPaginatedResponse(res, rows, page, limit, total);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserUnit = async (req, res) => {
  try {
    const { id_user, id_new_unit } = req.body;

    if (!id_user || !id_new_unit) {
      return sendResponse(res, {}, 'id user and new unit id are required', 400);
    }

    const updated = await changeUserUnit(id_user, id_new_unit);
    if (!updated) return sendResponse(res, {}, 'User not found', 404);

    sendResponse(res, {}, 'User group updated successfully');
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, 'Failed to update user group', 500);
  }
};

export const updateUnit = async (req, res) => {
  try {
    const idUnit = req.params.id;
    if (!idUnit) {
      return sendResponse(res, {}, 'Unit ID is required', 400);
    }

    const allowedFields = ['nama', 'keterangan', 'is_pbf', 'is_active'];
    
    // Filter request body to only allowed fields
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }


    if (Object.keys(updateData).length === 0)
      return sendResponse(res, {}, 'No valid fields provided', 400);

    const updated = await changeUnit(idUnit, updateData);

    if (!updated) return sendResponse(res, {}, 'Unit not found', 404);

    const unit = await getUnitById(idUnit); // return updated profile
    sendResponse(res, unit, 'Profile updated successfully');
  } catch (err) {
    console.error(err);
    sendResponse(res, {}, 'Failed to update unit', 500);
  }
};

