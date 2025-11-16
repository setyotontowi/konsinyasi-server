import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { findByUsername, createUser } from "../models/userModel.js";
dotenv.config();


export const register = async (req, res) => {
  const { username, password, nama, id_users_group, id_master_unit, keterangan } = req.body;

  try {
    // check if username already exists
    const existingUser = await findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert into database
    const userId = await createUser({
      username,
      password: hashedPassword,
      show_password: password, // optional for debugging, you can remove it later
      nama,
      id_users_group,
      id_master_unit: id_master_unit,
      keterangan: keterangan
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: userId, username, nama },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findByUsername(username);
    if (!user) return res.status(401).json({ message: "User not found or inactive" });

    // bcrypt compare (fallback if password not hashed yet)
    const match = await bcrypt.compare(password, user.password);
    if (!match && password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, 
        username: user.username, 
        name :user.nama,
        role: user.id_users_group, 
        unit: user.id_master_unit,
        unit_name : user.nama_unit
       },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, nama: user.nama },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const profile = async (req, res) => {
  res.json({ message: "Protected content", user: req.user });
};