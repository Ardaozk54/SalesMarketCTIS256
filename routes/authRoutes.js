import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import pool from "../db.js";
import {
  generateVerificationCode,
  sendVerificationEmail,
} from "../services/mail.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Sustainable Discount Marketplace",
    user: req.session.user || null,
  });
});

router.get("/db-test", async (req, res) => {
  const [rows] = await pool.query("SELECT NOW() AS currentTime");

  res.send(`
    <h1>Database Connection Works</h1>
    <p>Current DB Time: ${rows[0].currentTime}</p>
    <a href="/">Back</a>
  `);
});

router.get("/tables-test", async (req, res) => {
  const [rows] = await pool.query("SHOW TABLES");

  res.send(`
    <h1>Tables</h1>
    <pre>${JSON.stringify(rows, null, 2)}</pre>
    <a href="/">Back</a>
  `);
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

router.get("/register/market", (req, res) => {
  res.render("register-market", {
    title: "Market Register",
    form: {},
    errors: {},
  });
});

router.get("/register/consumer", (req, res) => {
  res.render("register-consumer", {
    title: "Consumer Register",
    form: {},
    errors: {},
  });
});

router.post(
  "/register/market",
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("name").notEmpty().withMessage("Market name is required."),
    body("password").notEmpty().withMessage("Password is required."),
    body("city").notEmpty().withMessage("City is required."),
    body("district").notEmpty().withMessage("District is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.render("register-market", {
        title: "Market Register",
        form,
        errors: errors.mapped(),
      });
    }

    const { email, name, password, city, district } = req.body;

    const [existingUsers] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.render("register-market", {
        title: "Market Register",
        form,
        errors: {
          email: {
            msg: "This email is already used.",
          },
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users 
      (role, email, password_hash, name, city, district, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ["market", email, passwordHash, name, city, district, 0]
    );

    const userId = result.insertId;
    const code = generateVerificationCode();

    await pool.query(
      `
      INSERT INTO verification_codes
      (user_id, code)
      VALUES (?, ?)
      `,
      [userId, code]
    );

    await sendVerificationEmail(email, code);

    res.redirect(`/verify/${userId}`);
  }
);

router.post(
  "/register/consumer",
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("name").notEmpty().withMessage("Full name is required."),
    body("password").notEmpty().withMessage("Password is required."),
    body("city").notEmpty().withMessage("City is required."),
    body("district").notEmpty().withMessage("District is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.render("register-consumer", {
        title: "Consumer Register",
        form,
        errors: errors.mapped(),
      });
    }

    const { email, name, password, city, district } = req.body;

    const [existingUsers] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.render("register-consumer", {
        title: "Consumer Register",
        form,
        errors: {
          email: {
            msg: "This email is already used.",
          },
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users 
      (role, email, password_hash, name, city, district, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ["consumer", email, passwordHash, name, city, district, 0]
    );

    const userId = result.insertId;
    const code = generateVerificationCode();

    await pool.query(
      `
      INSERT INTO verification_codes
      (user_id, code)
      VALUES (?, ?)
      `,
      [userId, code]
    );

    await sendVerificationEmail(email, code);

    res.redirect(`/verify/${userId}`);
  }
);

router.get("/verify/:userId", async (req, res) => {
  const userId = req.params.userId;

  const [codes] = await pool.query(
    `
    SELECT code 
    FROM verification_codes 
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (codes.length === 0) {
    return res.send("Verification code not found.");
  }

  res.render("verify", {
    title: "Email Verification",
    userId,
    code: codes[0].code,
    error: null,
  });
});

router.post("/verify/:userId", async (req, res) => {
  const userId = req.params.userId;
  const enteredCode = req.body.code;

  const [codes] = await pool.query(
    `
    SELECT code 
    FROM verification_codes 
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (codes.length === 0) {
    return res.send("Verification code not found.");
  }

  const realCode = codes[0].code;

  if (enteredCode !== realCode) {
    return res.render("verify", {
      title: "Email Verification",
      userId,
      code: realCode,
      error: "Invalid verification code.",
    });
  }

  await pool.query(
    `
    UPDATE users
    SET is_verified = 1
    WHERE id = ?
    `,
    [userId]
  );

  await pool.query(
    `
    DELETE FROM verification_codes
    WHERE user_id = ?
    `,
    [userId]
  );

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: null,
    form: {},
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = ?
    `,
    [email]
  );

  if (users.length === 0) {
    return res.render("login", {
      title: "Login",
      error: "Invalid email or password.",
      form: req.body,
    });
  }

  const user = users[0];

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return res.render("login", {
      title: "Login",
      error: "Invalid email or password.",
      form: req.body,
    });
  }

  if (user.is_verified === 0) {
    return res.render("login", {
      title: "Login",
      error: "Please verify your email before login.",
      form: req.body,
    });
  }

  req.session.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    city: user.city,
    district: user.district,
  };

  if (user.role === "market") {
    res.redirect("/market");
  } else {
    res.redirect("/consumer");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;
