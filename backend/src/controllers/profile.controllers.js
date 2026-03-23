import bcrypt from "bcrypt";
import pool from "../config/db.js";

const getProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Server error", data: error.message || error });
  }
};

const updateProfile = async (req, res) => {
  const { phone, password } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    let query = "";

    if (phone) {
      await pool.query(`UPDATE users SET phone = $1 where id = $2`, [phone, userId]);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(`UPDATE users SET password = $1 where id = $2`, [hashedPassword, userId]);
    }

    if (!phone && !password) {
      return res.status(400).json({ success: false, message: "No data provided to update" });
    }

    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error", data: error.message || error });
  }
};

export { getProfile, updateProfile };
