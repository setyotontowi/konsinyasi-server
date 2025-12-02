import { getAllHistoryStok, getStokLive } from "../models/stokModel.js";
import { sendResponse, sendPaginatedResponse } from "../helpers/responseHelper.js";
import { GROUP_VENDOR } from "../helpers/utilHelper.js";

export const getHistoryStok = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filters = {
      id_barang: req.query.id_barang,
      ed: req.query.ed,
      nobatch: req.query.nobatch,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const user = req.user || {}; // assuming middleware sets this (e.g., auth)

    const { data, pagination } = await getAllHistoryStok({
      page,
      limit,
      filters,
      user,
    });

    return sendPaginatedResponse(
      res,
      data,
      pagination.page,
      pagination.limit,
      pagination.total
    );
  } catch (error) {
    console.error("Error fetching history stok:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllStok = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;


    // If user group is vendor, then add unit into the filter. So the vendor can only see their items

    let filters = req.query || {};
    let search = req.query.search || "";
    filters = { ...filters, search }

    if (req.user && req.user.role === GROUP_VENDOR) {
      filters = { ...filters, unit: req.user.unit };
    }


    console.log(filters)

    const { data, pagination } = await getStokLive({ page, limit, filters: filters });

    return sendPaginatedResponse(
      res,
      data,
      pagination.page,
      pagination.limit,
      pagination.total
    );
  } catch (error) {
    console.error("Error fetching all stok records:", error);
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};