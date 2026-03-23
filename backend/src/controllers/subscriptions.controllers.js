import pool from "../config/db.js";

const getSubscriptions = async (req, res) => {
  try {
    const allSubscriptions = await pool.query("SELECT * FROM subscriptions");
    res.status(200).json({
      success: true,
      message: "Data fetched",
      data: allSubscriptions.rows,
    });
  } catch (error) {
    console.error("Error in getSubscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

const maintenance = async (req, res) => {
  const { flatType, price } = req.body;

  try {
    const result = await pool.query(
      "UPDATE subscriptions SET monthly_fee = $1 WHERE flat_type = $2 RETURNING *",
      [price, flatType],
    );

    res.status(201).json({
      success: true,
      message: "Monthly fee updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error.message || error,
    });
  }
};


const updateFees = async (req, res) => {
  const { amount, flatType } = req.body;
  const now = new Date();
  
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthYear = month === 12 ? year + 1 : year;
  
  const firstDayNextMonth = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`;
  console.log("Effective from:", firstDayNextMonth);

  try {
    const check = await pool.query(
      "select * from effective_subscriptions where effective_from = $1 and flat_type = $2",
      [firstDayNextMonth, flatType],
    );

    if (check.rows.length !== 0) {
      await pool.query(
        "update effective_subscriptions set subs_amount = $1 where effective_from = $2 and flat_type = $3 returning *",
        [amount, firstDayNextMonth, flatType],
      );
    } else {
      await pool.query(
        "insert into effective_subscriptions (subs_amount, flat_type, effective_from) values ($1, $2, $3) returning *",
        [amount, flatType, firstDayNextMonth],
      );
    }
    
    // Also update the current base subscriptions table, so the admin sees the updated amount
    await pool.query(
        "update subscriptions set monthly_fee = $1 where flat_type = $2",
        [amount, flatType]
    );

    res.status(201).json({
      success: true,
      message: "Monthly fee updated successfully"
    });

  } catch (err) {
    console.error("Error in updateFees:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: err.message || err
    });
  }
};


export { getSubscriptions, maintenance, updateFees };
