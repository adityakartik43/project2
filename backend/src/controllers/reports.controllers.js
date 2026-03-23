import pool from "../config/db.js";

const getFinancialReports = async (req, res) => {
  try {
    const now = new Date();

    // 1. Build 6-Month Data Arrays
    const summaryTable = [];

    let totalCollected6Months = 0;
    let totalPending6Months = 0;
    let cumulativePaidFlats = 0;
    let currentMonthPendingFlats = 0;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = d.toLocaleString("default", { month: "short" });
      const mDbStr = mStr.toLowerCase();
      const yStr = String(d.getFullYear());
      const longMonthStr = d.toLocaleString("default", { month: "long" });

      // First day of the target month as a date string for comparison
      const monthStart = `${yStr}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

      // Count only flats that existed at or before the target month
      const flatsAtTimeRes = await pool.query(
        `SELECT 
          COUNT(f.id) AS flat_count,
          COALESCE(SUM(s.monthly_fee), 0) AS expected_revenue
         FROM flats f
         JOIN subscriptions s ON f.flat_type = s.flat_type
         WHERE DATE_TRUNC('month', f.created_at) <= DATE_TRUNC('month', $1::date)`,
        [monthStart]
      );

      const flatsAtTime = parseInt(flatsAtTimeRes.rows[0].flat_count, 10);
      const expectedRevAtTime = parseFloat(flatsAtTimeRes.rows[0].expected_revenue);

      // Payments collected this month
      const monthStatsRes = await pool.query(
        `SELECT 
          COALESCE(SUM(amount), 0) AS collected,
          COUNT(DISTINCT flat_id) AS paid_flats_count
         FROM payments 
         WHERE payment_month = $1 AND payment_year = $2`,
        [mDbStr, yStr]
      );

      const monthCollected = parseFloat(monthStatsRes.rows[0].collected);
      const monthPaidFlatsCount = parseInt(monthStatsRes.rows[0].paid_flats_count, 10);

      // Pending = expected revenue from flats that existed that month minus what was collected
      let monthPending = expectedRevAtTime - monthCollected;
      if (monthPending < 0) monthPending = 0;

      // Accumulate totals
      totalCollected6Months += monthCollected;
      totalPending6Months += monthPending;
      cumulativePaidFlats += monthPaidFlatsCount;

      if (i === 0) {
        currentMonthPendingFlats = flatsAtTime - monthPaidFlatsCount;
        if (currentMonthPendingFlats < 0) currentMonthPendingFlats = 0;
      }

      const ratioStr = `${monthPaidFlatsCount} / ${flatsAtTime}`;
      const perfPct =
        flatsAtTime > 0
          ? ((monthPaidFlatsCount / flatsAtTime) * 100).toFixed(1) + "%"
          : "0%";

      summaryTable.unshift({
        period: `${longMonthStr} ${yStr}`,
        collected: monthCollected,
        pending: monthPending,
        ratio: ratioStr,
        perf: perfPct,
      });
    }

    // 2. Final Response
    res.status(200).json({
      success: true,
      message: "Financial reports fetched successfully",
      data: {
        stats: {
          totalCollected6Months,
          totalPending6Months,
          cumulativePaidFlats,
          currentMonthPendingFlats,
        },
        summaryTable,
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

export { getFinancialReports };


const getFinReports = async(req, res) => {
  
  const now = new Date();
  const year = now.toISOString().split("-")[0];

  // total collected amount in particular year
  const totalAmountCollectedInYear = await pool.query(
    "select sum(amount) as total_amount from payments where payment_year = $1", [year]
  )

}
