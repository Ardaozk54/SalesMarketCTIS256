import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { requireConsumer } from "../middleware/auth.js";
import { calculateGrandTotal } from "../services/cart.js";

const router = express.Router();

router.get("/consumer", requireConsumer, async (req, res) => {
  const consumer = req.session.user;

  const keyword = req.query.keyword || "";
  const page = Number(req.query.page || 1);
  const pageSize = 4;
  const offset = (page - 1) * pageSize;

  let products = [];
  let totalPages = 0;
  let message = null;

  if (keyword.trim() !== "") {
    const searchKeyword = `%${keyword}%`;

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM products p
      JOIN users m ON p.market_id = m.id
      WHERE p.title LIKE ?
        AND m.city = ?
        AND p.expiration_date >= CURDATE()
        AND p.stock > 0
      `,
      [searchKeyword, consumer.city]
    );

    const totalProducts = countRows[0].total;
    totalPages = Math.ceil(totalProducts / pageSize);

    const [rows] = await pool.query(
      `
      SELECT 
        p.*,
        m.name AS market_name,
        m.city AS market_city,
        m.district AS market_district,
        DATEDIFF(p.expiration_date, CURDATE()) AS days_left
      FROM products p
      JOIN users m ON p.market_id = m.id
      WHERE p.title LIKE ?
        AND m.city = ?
        AND p.expiration_date >= CURDATE()
        AND p.stock > 0
      ORDER BY 
        CASE 
          WHEN m.district = ? THEN 0
          ELSE 1
        END,
        p.expiration_date ASC
      LIMIT ? OFFSET ?
      `,
      [searchKeyword, consumer.city, consumer.district, pageSize, offset]
    );

    products = rows;

    if (products.length === 0) {
      message = "No matching products found.";
    }
  }

  res.render("consumer-home", {
    title: "Consumer Home",
    user: consumer,
    keyword,
    products,
    page,
    totalPages,
    message,
  });
});

router.get("/consumer/profile/edit", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;

  const [users] = await pool.query(
    `
    SELECT id, email, name, city, district
    FROM users
    WHERE id = ? AND role = 'consumer'
    `,
    [consumerId]
  );

  if (users.length === 0) {
    return res.redirect("/login");
  }

  res.render("consumer-profile-edit", {
    title: "Edit Consumer Profile",
    form: users[0],
    errors: {},
  });
});

router.post(
  "/consumer/profile/edit",
  requireConsumer,
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("name").notEmpty().withMessage("Full name is required."),
    body("city").notEmpty().withMessage("City is required."),
    body("district").notEmpty().withMessage("District is required."),
  ],
  async (req, res) => {
    const consumerId = req.session.user.id;
    const errors = validationResult(req);
    const form = req.body;

    if (!errors.isEmpty()) {
      return res.render("consumer-profile-edit", {
        title: "Edit Consumer Profile",
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
      [email, consumerId]
    );

    if (existingUsers.length > 0) {
      return res.render("consumer-profile-edit", {
        title: "Edit Consumer Profile",
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
        WHERE id = ? AND role = 'consumer'
        `,
        [email, name, city, district, passwordHash, consumerId]
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET email = ?,
            name = ?,
            city = ?,
            district = ?
        WHERE id = ? AND role = 'consumer'
        `,
        [email, name, city, district, consumerId]
      );
    }

    req.session.user.email = email;
    req.session.user.name = name;
    req.session.user.city = city;
    req.session.user.district = district;

    res.redirect("/consumer");
  }
);

router.post("/cart/add/:productId", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;
  const productId = req.params.productId;
  const consumerCity = req.session.user.city;

  const [products] = await pool.query(
    `
    SELECT p.*
    FROM products p
    JOIN users m ON p.market_id = m.id
    WHERE p.id = ?
      AND m.city = ?
      AND p.expiration_date >= CURDATE()
      AND p.stock > 0
    `,
    [productId, consumerCity]
  );

  if (products.length === 0) {
    return res.redirect("/consumer");
  }

  const product = products[0];

  const [cartItems] = await pool.query(
    `
    SELECT *
    FROM cart_items
    WHERE consumer_id = ? AND product_id = ?
    `,
    [consumerId, productId]
  );

  if (cartItems.length === 0) {
    await pool.query(
      `
      INSERT INTO cart_items
      (consumer_id, product_id, quantity)
      VALUES (?, ?, ?)
      `,
      [consumerId, productId, 1]
    );
  } else {
    const currentQuantity = cartItems[0].quantity;

    if (currentQuantity < product.stock) {
      await pool.query(
        `
        UPDATE cart_items
        SET quantity = quantity + 1
        WHERE consumer_id = ? AND product_id = ?
        `,
        [consumerId, productId]
      );
    }
  }

  res.redirect("/cart");
});

router.get("/cart", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;

  const [items] = await pool.query(
    `
    SELECT 
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.title,
      p.image,
      p.stock,
      p.normal_price,
      p.discounted_price,
      p.expiration_date,
      u.name AS market_name,
      u.city AS market_city,
      u.district AS market_district,
      DATEDIFF(p.expiration_date, CURDATE()) AS days_left
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN users u ON p.market_id = u.id
    WHERE ci.consumer_id = ?
    ORDER BY ci.created_at DESC
    `,
    [consumerId]
  );

  let grandTotal = 0;

  items.forEach((item) => {
    item.item_total = Number(item.discounted_price) * item.quantity;
    grandTotal += item.item_total;
  });

  res.render("cart", {
    title: "My Cart",
    user: req.session.user,
    items,
    grandTotal,
  });
});

router.post("/cart/update/:cartItemId", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;
  const cartItemId = req.params.cartItemId;
  const quantity = Number(req.body.quantity);

  const [items] = await pool.query(
    `
    SELECT 
      ci.id,
      ci.quantity,
      p.stock,
      p.discounted_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.id = ? AND ci.consumer_id = ?
    `,
    [cartItemId, consumerId]
  );

  if (items.length === 0) {
    return res.json({
      success: false,
      message: "Cart item not found.",
    });
  }

  const item = items[0];

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.json({
      success: false,
      message: "Quantity must be at least 1.",
      oldQuantity: item.quantity,
    });
  }

  if (quantity > item.stock) {
    return res.json({
      success: false,
      message: "Quantity cannot be greater than stock.",
      oldQuantity: item.quantity,
    });
  }

  await pool.query(
    `
    UPDATE cart_items
    SET quantity = ?
    WHERE id = ? AND consumer_id = ?
    `,
    [quantity, cartItemId, consumerId]
  );

  const itemTotal = Number(item.discounted_price) * quantity;
  const grandTotal = await calculateGrandTotal(consumerId);

  res.json({
    success: true,
    quantity,
    itemTotal,
    grandTotal,
  });
});

router.post("/cart/remove/:cartItemId", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;
  const cartItemId = req.params.cartItemId;

  await pool.query(
    `
    DELETE FROM cart_items
    WHERE id = ? AND consumer_id = ?
    `,
    [cartItemId, consumerId]
  );

  const grandTotal = await calculateGrandTotal(consumerId);

  const [items] = await pool.query(
    `
    SELECT id
    FROM cart_items
    WHERE consumer_id = ?
    `,
    [consumerId]
  );

  res.json({
    success: true,
    grandTotal,
    cartIsEmpty: items.length === 0,
  });
});

router.post("/cart/purchase", requireConsumer, async (req, res) => {
  const consumerId = req.session.user.id;

  const [items] = await pool.query(
    `
    SELECT 
      ci.product_id,
      ci.quantity,
      p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.consumer_id = ?
    `,
    [consumerId]
  );

  if (items.length === 0) {
    return res.json({
      success: false,
      message: "Your cart is empty.",
    });
  }

  for (const item of items) {
    if (item.quantity > item.stock) {
      return res.json({
        success: false,
        message: "Some products do not have enough stock.",
      });
    }
  }

  for (const item of items) {
    const newStock = item.stock - item.quantity;

    if (newStock > 0) {
      await pool.query(
        `
        UPDATE products
        SET stock = ?
        WHERE id = ?
        `,
        [newStock, item.product_id]
      );
    } else {
      await pool.query(
        `
        DELETE FROM products
        WHERE id = ?
        `,
        [item.product_id]
      );
    }
  }

  await pool.query(
    `
    DELETE FROM cart_items
    WHERE consumer_id = ?
    `,
    [consumerId]
  );

  res.json({
    success: true,
  });
});

export default router;
