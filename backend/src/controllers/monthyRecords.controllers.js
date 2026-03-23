import pool from "../config/db.js";

const getAllDetails = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required" });
    }

    const monthLower = month.slice(0, 3).toLowerCase();
    const yearStr = String(year);

    // 1. Total Flats
    const totalFlatsResult = await pool.query('SELECT COUNT(*) FROM flats');
    const totalFlats = parseInt(totalFlatsResult.rows[0].count, 10);

    // 2. Paid Flats (Current Month)
    const paidFlatsResult = await pool.query(
      'SELECT COUNT(DISTINCT flat_id) FROM payments WHERE payment_month = $1 AND payment_year = $2',
      [monthLower, yearStr]
    );
    const paidFlats = parseInt(paidFlatsResult.rows[0].count, 10);

    // 3. Pending Flats
    const pendingFlats = totalFlats - paidFlats;

    // 4. Total Collected (Current Month)
    const totalCollectedResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_month = $1 AND payment_year = $2',
      [monthLower, yearStr]
    );
    const totalCollected = parseFloat(totalCollectedResult.rows[0].total) || 0;

    // 5. Comprehensive Table List
    // We want all flats, their owners, their expected amount (from subscriptions), 
    // and if they've paid this month, the actual amount, status, and payment date.
    const tableListQuery = `
      SELECT 
        f.id as flat_id, 
        f.flat_number, 
        COALESCE(u.name, 'No Owner') as owner_name, 
        s.monthly_fee as expected_amount,
        p.amount as amount_paid,
        CASE 
        WHEN 
        p.id IS NOT NULL THEN 'Paid' 
        ELSE 
        'Pending' END as status,
        p.transaction_date
      FROM flats f
      LEFT JOIN users u ON f.owner_id = u.id
      JOIN subscriptions s ON f.flat_type = s.flat_type
      LEFT JOIN payments p ON f.id = p.flat_id AND p.payment_month = $1 AND p.payment_year = $2
      ORDER BY f.flat_number ASC
    `;
    const tableListResult = await pool.query(tableListQuery, [monthLower, yearStr]);
    const records = tableListResult.rows;

    res.status(200).json({
      success: true,
      message: "Monthly records fetched successfully",
      data: {
        stats: {
          totalFlats,
          paidFlats,
          pendingFlats,
          totalCollected,
        },
        records: records
      }
    });

  } catch (error) {
    console.error("Error fetching monthly records:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};

export { getAllDetails };
