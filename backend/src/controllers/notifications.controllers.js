import pool from "../config/db.js";
import crypto from "crypto";

const sendNotifications = async (req, res) => {
  const { title, message, date: expireDate } = req.body;
  const userId = req.user.id;

  try {
    const notificationRes = await pool.query(
      "INSERT INTO notifications (title, content, created_by, expires_at) VALUES ($1, $2, $3, $4) RETURNING id",
      [title, message, userId, expireDate],
    );
    const notificationId = notificationRes.rows[0].id;

    // Notify all users via user_notifications table
    const residents = await pool.query("SELECT id FROM users");
    if (residents.rows.length > 0) {
      // Build bulk insert string
      const values = residents.rows.map((r, i) => `($${i*4 + 1}, $${i*4 + 2}, $${i*4 + 3}, $${i*4 + 4})`).join(', ');
      let queryParams = [];
      residents.rows.forEach(r => {
        queryParams.push(crypto.randomUUID(), r.id, notificationId, false);
      });
      await pool.query(`INSERT INTO user_notifications (id, user_id, notification_id, is_read) VALUES ${values}`, queryParams);
    }

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error,
    });
  }
};

// Admin: Get all notifications sent
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.content, n.created_at, u.name AS sent_by
             FROM notifications n
             JOIN users u ON u.id = n.created_by
             ORDER BY n.created_at DESC`,
    );

    res.status(200).json({
      success: true,
      message: "Notifications fetched",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error,
    });
  }
};

// Resident: Get all notifications for specific user including is_read
const getResidentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT n.id, n.title, n.content, n.created_at, u.name AS sent_by, un.is_read
             FROM notifications n
             JOIN users u ON u.id = n.created_by
             JOIN user_notifications un ON n.id = un.notification_id
             WHERE un.user_id = $1
             ORDER BY n.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Notifications fetched",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query(
      "UPDATE user_notifications SET is_read = true WHERE notification_id = $1 AND user_id = $2",
      [id, userId]
    );
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", data: error });
  }
};

const getHasUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM user_notifications WHERE user_id = $1 AND is_read = false) AS has_unread",
      [userId]
    );
    res.status(200).json({ success: true, data: { hasUnread: result.rows[0].has_unread } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", data: error });
  }
};

export { sendNotifications, getNotifications, getResidentNotifications, markAsRead, getHasUnread };
