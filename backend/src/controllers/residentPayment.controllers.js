import pool from "../config/db.js";

const makePayment = async (req, res) => {
  const { user_id, amount, month, year, mode } = req.body;

  if (!user_id || !amount || !month || !year || !mode) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Convert month to 3 letters lowercase (e.g., "March" -> "mar")
  const mStrLower = month.slice(0, 3).toLowerCase();

  try {
    // 1. Get flat details for the user
    const flatDetails = await pool.query(
      "SELECT id FROM flats WHERE owner_id = $1",
      [user_id],
    );

    if (flatDetails.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not found for this user" });
    }

    const flat_id = flatDetails.rows[0].id;

    // 2. Fetch monthly fee for the flat to record subs_amount (if needed by DB schema)
    const subQuery = await pool.query(
      `SELECT monthly_fee FROM subscriptions s 
       JOIN flats f ON f.flat_type = s.flat_type 
       WHERE f.id = $1`,
      [flat_id],
    );
    const subs_amount =
      subQuery.rows.length > 0 ? parseFloat(subQuery.rows[0].monthly_fee) : 0;

    // 3. Insert payment record
    const transaction_id = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const transaction_date = new Date();

    const insertResult = await pool.query(
      `INSERT INTO payments (user_id, flat_id, amount, payment_month, payment_year, payment_mode, transaction_id, transaction_date, subs_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        user_id,
        flat_id,
        amount,
        mStrLower,
        year,
        mode,
        transaction_id,
        transaction_date,
        subs_amount,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Payment successful",
      transactionId: transaction_id,
      id: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error("Error in makePayment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { makePayment };
