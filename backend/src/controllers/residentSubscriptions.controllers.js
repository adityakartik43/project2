import pool from "../config/db.js";

const getResidentBillingHistory = async (req, res) => {
  const { user_id } = req.params;

  try {
    const userResult = await pool.query(
      "SELECT created_at FROM users WHERE id = $1",
      [user_id],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const userCreatedAt = new Date(userResult.rows[0].created_at);
    // Start of the month they were created
    const startOfMonthJoined = new Date(
      userCreatedAt.getFullYear(),
      userCreatedAt.getMonth(),
      1,
    );

    const flatDetails = await pool.query(
      "SELECT flat_type FROM flats WHERE owner_id = $1",
      [user_id],
    );

    if (flatDetails.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not found for this user" });
    }

    const flat = flatDetails.rows[0];

    const subsQuery = await pool.query(
      `SELECT monthly_fee FROM subscriptions WHERE flat_type = $1`,
      [flat.flat_type],
    );
    const monthly_fee =
      subsQuery.rows.length > 0 ? parseFloat(subsQuery.rows[0].monthly_fee) : 0;

    const paymentsQuery = await pool.query(
      `SELECT 
         payment_month as month, 
         payment_year as year, 
         SUM(amount) as amount,
         MAX(payment_mode) as mode,
         to_char(MAX(transaction_date), 'DD Mon YYYY') as date,
         MAX(subs_amount) as subs_amount
       FROM payments 
       WHERE user_id = $1
       GROUP BY payment_month, payment_year`,
      [user_id],
    );
    const payments = paymentsQuery.rows;

    const history = [];
    const now = new Date();

    // Calculate total months between user creation and now, so we show ALL history
    const monthsElapsed =
      (now.getFullYear() - userCreatedAt.getFullYear()) * 12 +
      (now.getMonth() - userCreatedAt.getMonth());

    for (let i = 0; i <= monthsElapsed; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

      // Stop if the month is before they joined (safety net)
      if (d < startOfMonthJoined) break;

      const mStrLower = d
        .toLocaleString("default", { month: "short" })
        .toLowerCase();
      const mStrFull = d.toLocaleString("default", { month: "long" });
      const yStr = d.getFullYear().toString();
      const id = `${mStrFull.toLowerCase()}-${yStr}`;
      const title = `${mStrFull} ${yStr}`;

      const payment = payments.find(
        (p) => p.month === mStrLower && p.year === yStr,
      );

      if (payment) {
        const billedAmount = parseFloat(payment.subs_amount) || monthly_fee;
        history.push({
          id,
          title,
          amount: billedAmount,
          paid_amount: parseFloat(payment.amount),
          mode: payment.mode.toUpperCase(),
          status: parseFloat(payment.amount) >= billedAmount ? "PAID" : "PARTIAL",
          date: payment.date,
        });
      } else {
        history.push({
          id,
          title,
          amount: monthly_fee,
          paid_amount: 0,
          mode: "--",
          status: i === 0 ? "PENDING" : "OVERDUE",
          date: "--",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Billing history fetched",
      data: history,
    });
  } catch (error) {
    console.error("Error in getResidentBillingHistory:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSubscriptionDetail = async (req, res) => {
  const { user_id, month_year } = req.params;
  const [monthFull, year] = month_year.split("-");

  if (!monthFull || !year) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid month_year format" });
  }

  const monthLower = monthFull.slice(0, 3).toLowerCase();
  const billingPeriod = `${monthFull.charAt(0).toUpperCase() + monthFull.slice(1)} ${year}`;

  try {
    const flatDetails = await pool.query(
      "SELECT flat_number, flat_type FROM flats WHERE owner_id = $1",
      [user_id],
    );

    if (flatDetails.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not found for this user" });
    }

    const flat = flatDetails.rows[0];

    const subsQuery = await pool.query(
      `SELECT monthly_fee FROM subscriptions WHERE flat_type = $1`,
      [flat.flat_type],
    );
    const monthly_fee =
      subsQuery.rows.length > 0 ? parseFloat(subsQuery.rows[0].monthly_fee) : 0;

    // Fetch ALL payments for this month
    const paymentQuery = await pool.query(
      `SELECT 
         id,
         amount, 
         payment_mode, 
         transaction_id,
         subs_amount,
         to_char(transaction_date, 'DD Mon YYYY') as date
       FROM payments 
       WHERE user_id = $1 AND payment_month = $2 AND payment_year = $3
       ORDER BY transaction_date ASC`,
      [user_id, monthLower, year],
    );

    const payments = paymentQuery.rows;
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const isPaid = payments.length > 0;
    
    // Use subs_amount from the first payment row if it exists, otherwise use current fee
    const effectiveMonthlyFee = isPaid && payments[0].subs_amount 
      ? parseFloat(payments[0].subs_amount) 
      : monthly_fee;

    const data = {
      billingPeriod,
      flatNumber: flat.flat_number,
      flatType: flat.flat_type,
      monthlyFee: effectiveMonthlyFee,
      status: isPaid ? (totalPaid >= effectiveMonthlyFee ? "PAID" : "PARTIAL") : "UNPAID",
      totalPaid,
      outstanding: Math.max(0, effectiveMonthlyFee - totalPaid),
      payments,  // all individual payment rows
    };

    res.status(200).json({
      success: true,
      message: "Subscription detail fetched",
      data,
    });
  } catch (error) {
    console.error("Error in getSubscriptionDetail:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getResidentBillingHistory, getSubscriptionDetail };
