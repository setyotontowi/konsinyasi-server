
import { listAllUsers } from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await listAllUsers();
    res.json(users);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
