import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import pool from "../db.js";
import upload from "../config/upload.js";
import { requireMarket } from "../middleware/auth.js";

const router = express.Router();

router.get("/market", requireMarket, async (req, res) => {
  const marketId = req.session.user.id;

  const [products] = await pool.query(
    `
    SELECT *,
      expiration_date < CURDATE() AS is_expired
    FROM products
    WHERE market_id = ?
    ORDER BY expiration_date ASC
    `,
    [marketId]
  );

  res.render("market-dashboard", {
    title: "Market Dashboard",
    user: req.session.user,
    products,
  });
});

router.get("/market/profile/edit", requireMarket, async (req, res) => {
  const marketId = req.session.user.id;

  const [users] = await pool.query(
    `
    SELECT id, email, name, city, district
    FROM users
    WHERE id = ? AND role = 'market'
    `,
    [marketId]
  );

  if (users.length === 0) {
    return res.redirect("/login");
  }

  res.render("market-profile-edit", {
    title: "Edit Market Profile",
    form: users[0],
    errors: {},
  });
});

router.post(
  "/market/profile/edit",
  requireMarket,
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("name").notEmpty().withMessage("Market name is required."),
    body("city").notEmpty().withMessage("City is required."),
    body("district").notEmpty().withMessage("District is required."),
  ],
  async (req, res) => {
    const marketId = req.session.user.id;
    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.render("market-profile-edit", {
        title: "Edit Market Profile",
        form,
        errors: errors.mapped(),
      });
    }

    const { email, name, city, district, password } = req.body;

    const [existingUsers] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = ? AND id <> ?
      `,
      [email, marketId]
    );

    if (existingUsers.length > 0) {
      return res.render("market-profile-edit", {
        title: "Edit Market Profile",
        form,
        errors: {
          email: {
            msg: "This email is already used by another account.",
          },
        },
      });
    }

    if (password && password.trim() !== "") {
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(
        `
        UPDATE users
        SET email = ?,
            name = ?,
            city = ?,
            district = ?,
            password_hash = ?
        WHERE id = ? AND role = 'market'
        `,
        [email, name, city, district, passwordHash, marketId]
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET email = ?,
            name = ?,
            city = ?,
            district = ?
        WHERE id = ? AND role = 'market'
        `,
        [email, name, city, district, marketId]
      );
    }

    req.session.user.email = email;
    req.session.user.name = name;
    req.session.user.city = city;
    req.session.user.district = district;

    res.redirect("/market");
  }
);

router.get("/market/products/add", requireMarket, (req, res) => {
  res.render("market-product-add", {
    title: "Add Product",
    form: {},
    errors: {},
  });
});

router.post(
  "/market/products/add",
  requireMarket,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Product title is required."),
    body("stock").isInt({ min: 1 }).withMessage("Stock must be at least 1."),
    body("normal_price")
      .isFloat({ min: 0.01 })
      .withMessage("Normal price must be greater than 0."),
    body("discounted_price")
      .isFloat({ min: 0.01 })
      .withMessage("Discounted price must be greater than 0."),
    body("expiration_date").notEmpty().withMessage("Expiration date is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const form = req.body;
    const errorObject = errors.mapped();

    if (!req.file) {
      errorObject.image = {
        msg: "Product image is required.",
      };
    }

    if (Object.keys(errorObject).length > 0) {
      return res.render("market-product-add", {
        title: "Add Product",
        form,
        errors: errorObject,
      });
    }

    const marketId = req.session.user.id;
    const { title, stock, normal_price, discounted_price, expiration_date } =
      req.body;

    const imagePath = "/uploads/" + req.file.filename;

    await pool.query(
      `
      INSERT INTO products
      (market_id, title, stock, normal_price, discounted_price, expiration_date, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        marketId,
        title,
        stock,
        normal_price,
        discounted_price,
        expiration_date,
        imagePath,
      ]
    );

    res.redirect("/market");
  }
);

router.get("/market/products/:id/edit", requireMarket, async (req, res) => {
  const productId = req.params.id;
  const marketId = req.session.user.id;

  const [products] = await pool.query(
    `
    SELECT *
    FROM products
    WHERE id = ? AND market_id = ?
    `,
    [productId, marketId]
  );

  if (products.length === 0) {
    return res.redirect("/market");
  }

  const product = products[0];

  res.render("market-product-edit", {
    title: "Edit Product",
    product,
    form: product,
    errors: {},
  });
});

router.post(
  "/market/products/:id/edit",
  requireMarket,
  upload.single("image"),
  [
    body("title").notEmpty().withMessage("Product title is required."),
    body("stock").isInt({ min: 1 }).withMessage("Stock must be at least 1."),
    body("normal_price")
      .isFloat({ min: 0.01 })
      .withMessage("Normal price must be greater than 0."),
    body("discounted_price")
      .isFloat({ min: 0.01 })
      .withMessage("Discounted price must be greater than 0."),
    body("expiration_date").notEmpty().withMessage("Expiration date is required."),
  ],
  async (req, res) => {
    const productId = req.params.id;
    const marketId = req.session.user.id;

    const [products] = await pool.query(
      `
      SELECT *
      FROM products
      WHERE id = ? AND market_id = ?
      `,
      [productId, marketId]
    );

    if (products.length === 0) {
      return res.redirect("/market");
    }

    const oldProduct = products[0];

    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.render("market-product-edit", {
        title: "Edit Product",
        product: oldProduct,
        form,
        errors: errors.mapped(),
      });
    }

    const { title, stock, normal_price, discounted_price, expiration_date } =
      req.body;

    let imagePath = oldProduct.image;

    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    await pool.query(
      `
      UPDATE products
      SET title = ?,
          stock = ?,
          normal_price = ?,
          discounted_price = ?,
          expiration_date = ?,
          image = ?
      WHERE id = ? AND market_id = ?
      `,
      [
        title,
        stock,
        normal_price,
        discounted_price,
        expiration_date,
        imagePath,
        productId,
        marketId,
      ]
    );

    res.redirect("/market");
  }
);

router.post("/market/products/:id/delete", requireMarket, async (req, res) => {
  const productId = req.params.id;
  const marketId = req.session.user.id;

  await pool.query(
    `
    DELETE FROM products
    WHERE id = ? AND market_id = ?
    `,
    [productId, marketId]
  );

  res.redirect("/market");
});

export default router;
