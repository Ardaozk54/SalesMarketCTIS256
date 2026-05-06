import pool from "../db.js";

export async function calculateGrandTotal(consumerId) {
  const [items] = await pool.query(
    `
    SELECT ci.quantity, p.discounted_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.consumer_id = ?
    `,
    [consumerId]
  );

  let grandTotal = 0;

  items.forEach((item) => {
    grandTotal += Number(item.discounted_price) * item.quantity;
  });

  return grandTotal;
}
