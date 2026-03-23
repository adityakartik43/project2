import pool from "../config/db.js";

function generateTransactionId() {
  const prefix = "TXN";
  const random = Math.floor(Math.random() * 1000000000);
  return prefix + Date.now() + random;
}

const makePayment = async (req, res) => {
  const { flatNo, amount, year, mode, date } = req.body;
  let { transactionId, month } = req.body;

  month = month.slice(0, 3).toLowerCase();

  try {
    if (!transactionId) {
      transactionId = generateTransactionId();
    }

    const getIDs = await pool.query(
      `SELECT u.id AS user_id, f.id AS flat_id
       FROM users u
       JOIN flats f ON f.owner_id = u.id
       WHERE f.flat_number = $1`,
      [flatNo],
    );

    const { user_id, flat_id } = getIDs.rows[0];

    const subsAmount = await pool.query(
        `select s.monthly_fee as subs_amount from subscriptions as s
        join flats as f
        on s.flat_type = f.flat_type
        where f.id = $1`,
      [flat_id],
    );

    const { subs_amount } = subsAmount.rows[0];

    await pool.query(
      `INSERT INTO payments 
      (user_id, flat_id, amount, payment_month, payment_year, payment_mode, transaction_id, transaction_date, subs_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9)`,
      [user_id, flat_id, amount, month, year, mode, transactionId, date, subs_amount],
    );

    res.status(201).json({
      message: "Payment successful",
      transactionId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
      data: error,
    });
  }
};

const residentData = async (req, res) => {
  const { flatNo } = req.params;

  try {
    const getDataQuery = `select u.name, s.monthly_fee 
     from users as u
     join flats as f
     on f.owner_id = u.id
     join subscriptions as s
     on s.flat_type = f.flat_type
     where f.flat_number = $1`;

    const resData = await pool.query(getDataQuery, [flatNo]);

    res.status(200).json({
      success: true,
      message: "Data fetched",
      data: resData.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Server error",
      data: null,
    });
  }
};

const recentEntries = async (req, res) => {
  const now = new Date();
  let currentMonth = now.toLocaleString("default", { month: "long" });
  currentMonth = currentMonth.slice(0, 3).toLowerCase();
  const currentYear = now.getFullYear();

  try {
    const getDataQuery = `select f.flat_number, p.amount, p.payment_mode, p.transaction_date
    from flats as f 
    join payments as p
    on f.owner_id = p.user_id 
    where p.payment_month = $1 and p.payment_year = $2`;

    const resData = await pool.query(getDataQuery, [currentMonth, currentYear]);

    res.status(200).json({
      success: true,
      message: "Data fetched",
      data: resData.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Server error",
      data: null,
    });
  }
};

export { makePayment, residentData, recentEntries };
