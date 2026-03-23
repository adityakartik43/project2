import pool from "../config/db.js";

const residentDashboard = async (req, res) => {
  const { user_id } = req.params;

  try {
    // getting flat number and flat_type
    const flatDetails = await pool.query(
      "SELECT id, flat_number, flat_type FROM flats WHERE owner_id = $1",
      [user_id],
    );

    if (flatDetails.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not found for this user" });
    }

    const flat = flatDetails.rows[0];
    const flat_id = flat.id;

    const currentYear = new Date().getFullYear().toString();
    const now = new Date();
    const currentMonth = now
      .toLocaleString("default", { month: "short" })
      .toLowerCase();

    // getting total amount paid by user in current year
    const getTotalAmountPaidInYear = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE user_id = $1 AND payment_year = $2`,
      [user_id, currentYear],
    );

    // Check if there's an existing payment this month; if so, use its recorded subs_amount.
    // This preserves the fee that was active when the payment was made.
    // If no payment yet, fall back to the current fee in the subscriptions table.
    const currentMonthPaymentQuery = await pool.query(
      `SELECT subs_amount FROM payments 
       WHERE user_id = $1 AND payment_month = $2 AND payment_year = $3 
       ORDER BY transaction_date DESC LIMIT 1`,
      [user_id, currentMonth, currentYear],
    );

    let subsAmount;
    let paidThisMonth;

    if (currentMonthPaymentQuery.rows.length > 0) {
      // Payment exists this month — use its recorded subs_amount and actual paid amount
      const getTotalAmountPaidInMonth = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE user_id = $1 AND payment_month = $2 AND payment_year = $3`,
        [user_id, currentMonth, currentYear],
      );
      subsAmount = parseFloat(currentMonthPaymentQuery.rows[0].subs_amount);
      paidThisMonth = parseFloat(getTotalAmountPaidInMonth.rows[0].sum);
    } else {
      // No payment yet — get the current fee from subscriptions table
      const subsQuery = await pool.query(
        `SELECT monthly_fee FROM subscriptions WHERE flat_type = $1`,
        [flat.flat_type],
      );
      subsAmount = subsQuery.rows.length > 0 ? parseFloat(subsQuery.rows[0].monthly_fee) : 0;
      paidThisMonth = 0;
    }

    // outstanding = what they owe this month minus what they've paid
    let outstandingAmount = subsAmount - paidThisMonth;
    if (outstandingAmount < 0) outstandingAmount = 0;

    // getting recent payments limit 5
    const recentPaymentsQuery = await pool.query(
      `SELECT payment_month as month, amount, payment_mode as mode, 'PAID' as status, to_char(transaction_date, 'DD Mon YYYY') as date 
             FROM payments 
             WHERE user_id = $1 
             ORDER BY transaction_date DESC 
             LIMIT 5`,
      [user_id],
    );

    res.status(200).json({
      success: true,
      message: "Data fetched",
      data: {
        flatNumber: flat.flat_number,
        flatType: flat.flat_type,
        totalAmount: parseFloat(getTotalAmountPaidInYear.rows[0].sum),
        outstandingAmount: outstandingAmount,
        recentPayments: recentPaymentsQuery.rows,
      },
    });
  } catch (error) {
    console.error("Error in residentDashboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { residentDashboard };
