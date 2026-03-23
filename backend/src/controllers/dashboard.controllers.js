import pool from "../config/db.js";

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'short' }).toLowerCase();
    const currentYear = now.getFullYear();

    // console.log(currentMonth, currentYear);

    // 1. Total Flats
    const totalFlatsResult = await pool.query('SELECT COUNT(*) FROM flats');
    const totalFlats = parseInt(totalFlatsResult.rows[0].count, 10);

    // 2. Paid Flats (Current Month)
    const paidFlatsResult = await pool.query(
      'SELECT COUNT(DISTINCT flat_id) FROM payments WHERE payment_month = $1 AND payment_year = $2',
      [currentMonth, String(currentYear)]
    );
    const paidFlats = parseInt(paidFlatsResult.rows[0].count, 10);

    // console.log(paidFlats);

    // 3. Pending Flats
    // Simply total flats minus paid flats
    const pendingFlats = totalFlats - paidFlats;

    // 4. Total Collected (Current Month)
    const totalCollectedResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_month = $1 AND payment_year = $2',
      [currentMonth, String(currentYear)]
    );
    const totalCollected = parseFloat(totalCollectedResult.rows[0].total) || 0;

    // 5. Recent 5 Payment Records
    const recentRecordsResult = await pool.query(`
      SELECT f.flat_number, u.name as owner_name, p.payment_month, p.payment_mode, p.transaction_date, p.amount
      FROM payments p
      JOIN flats f ON p.flat_id = f.id
      JOIN users u ON f.owner_id = u.id
      ORDER BY p.transaction_date DESC, p.id DESC
      LIMIT 10
    `);
    const recentRecords = recentRecordsResult.rows;

    // 6. Pending Payments List (flats with owners that haven't paid this month)
    const pendingListResult = await pool.query(`
      SELECT f.flat_number, s.monthly_fee as amount
      FROM flats f
      JOIN subscriptions s ON f.flat_type = s.flat_type
      WHERE f.owner_id IS NOT NULL 
      AND f.id NOT IN (
        SELECT flat_id FROM payments WHERE payment_month = $1 AND payment_year = $2
      )
    `, [currentMonth, String(currentYear)]);
    const pendingList = pendingListResult.rows;

    // 7. Collection Overview (Last 6 Months)
    // To do this simply, we will generate the last 6 months in code and query for each, or run a GROUP BY.
    // For simplicity and to ensure empty months zeroes out, we do it in JS:
    const barChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = d.toLocaleString('default', { month: 'short' });
      const mStrLower = mStr.toLowerCase();
      const yStr = String(d.getFullYear());
      
      const monthSumRes = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_month = $1 AND payment_year = $2',
        [mStrLower, yStr]
      );
      
      barChartData.push({
        name: mStr, // capitalized for display e.g. "Mar"
        amount: parseFloat(monthSumRes.rows[0].total) || 0
      });
    }

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalFlats,
        paidFlats,
        pendingFlats,
        totalCollected,
        recentRecords,
        pendingList,
        barChartData
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};

export { getDashboardStats };
