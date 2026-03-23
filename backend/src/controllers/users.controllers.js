import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const registerUser = async (req, res) => {
  // console.log("first");

  //getting all values from form
  const { name, email, phone, flatNo, role } = req.body;

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    //making deafult raw password
    const rawPassword = `${name.split(" ")[0].toLowerCase()}${phone.slice(-4)}`;
    console.log(rawPassword);

    //hashing password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    console.log(hashedPassword);

    // insert data on table
    const result = await pool.query(
      "insert into users (name, email, password, role, phone) values ($1,$2,$3,$4,$5) returning id, name, email, phone",
      [name, email, hashedPassword, role, phone],
    );

    console.log("user register ho gya hai");

    // mapping flat number to resident

    const flatQuery = `
      UPDATE flats
      SET owner_id = $1
      WHERE flat_number = $2
    `;

    console.log("Query tk thik hai");

    await pool.query(flatQuery, [result.rows[0]?.id, flatNo]);

    res.status(201).json({
      success: true,
      message: `${result.rows[0]?.id} flat created successfully`,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error.message || error,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error.message || error,
    });
  }
};

const getDetails = async (req, res) => {
  // "Flat Details	Owner Info	Contact	Actions"

  // console.log("get details called")
  try {
    const allDetails = await pool.query(
      `select f.id, f.flat_number, u.name, u.phone, u.role, f.flat_type
      from users as u
      join flats as f
      on u.id = f.owner_id`,
    );

    // console.log("get details 2nd time")

    res.status(201).json({
      success: true,
      message: "Data fetched",
      data: allDetails.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

const editFlatOwner = async (req, res) => {
  const { name, email, phone, flatNo, role } = req.body;

  try {
    const flatCheck = await pool.query(
      "SELECT * FROM flats WHERE flat_number=$1",
      [flatNo],
    );

    if (flatCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const previousOwnerId = flatCheck.rows[0].owner_id;

    const userCheck = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const rawPassword = `${name.split(" ")[0].toLowerCase()}${phone.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUserResult = await pool.query(
      "INSERT INTO users (name, email, password, role, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone",
      [name, email, hashedPassword, role, phone],
    );
    const newOwnerId = newUserResult.rows[0].id;

    await pool.query("UPDATE flats SET owner_id = $1 WHERE flat_number = $2", [
      newOwnerId,
      flatNo,
    ]);

    if (previousOwnerId) {
      await pool.query("DELETE FROM users WHERE id = $1", [previousOwnerId]);
    }

    res.status(200).json({
      success: true,
      message: `Owner for flat ${flatNo} changed successfully`,
      data: newUserResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: error,
    });
  }
};

const getVacantFlats = async (req, res) => {
  const allDetails = await pool.query(
    "select * from flats where owner_id is null",
  );
  res.status(200).json({
    success: true,
    message: "Data fetched",
    data: allDetails.rows,
  });
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      // Email not found in DB — redirect to login with error
      return res.redirect(
        `http://localhost:3000/admin/login?error=No+account+found+for+this+Google+email.+Please+register+first.`
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userData = encodeURIComponent(
      JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })
    );

    // Redirect to the appropriate frontend login page based on role
    const frontendBase =
      user.role === "admin"
        ? "http://localhost:3000/admin/login"
        : "http://localhost:3000/resident/login";

    return res.redirect(`${frontendBase}?token=${token}&user=${userData}`);
  } catch (error) {
    console.error("Error in googleCallback:", error);
    return res.redirect(
      `http://localhost:3000/admin/login?error=Server+error+during+Google+login`
    );
  }
};

export { registerUser, loginUser, getDetails, getVacantFlats, editFlatOwner, googleCallback };
