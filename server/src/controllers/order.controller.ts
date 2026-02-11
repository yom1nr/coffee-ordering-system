import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

interface OrderRow extends RowDataPacket {
  id: number;
  user_id: number | null;
  customer_name: string | null;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  username?: string;
  display_name?: string;
}

interface OrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  sub_total: number;
  options_json: any;
  product_name?: string;
  product_image?: string;
}

interface CartItemPayload {
  id: number;
  quantity: number;
  selectedOptions: { name: string; price: number; group: string }[];
  base_price: number;
  totalPrice: number;
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  let conn: PoolConnection | undefined;
  try {
    const user = req.user as jwt.JwtPayload | undefined;
    const userId = user ? user.id : null;

    const { items, customerName } = req.body as { items: CartItemPayload[], customerName?: string };

    if (!items || items.length === 0) {
      res.status(400).json({ message: "Cart is empty." });
      return;
    }

    const pool = getPool();
    conn = await pool.getConnection();

    await conn.beginTransaction();

    let totalPrice = 0;

    for (const item of items) {
      const [productRows] = await conn.query<RowDataPacket[]>(
        "SELECT stock, name FROM products WHERE id = ?",
        [item.id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.id} not found.`);
      }

      const product = productRows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Sorry, "${product.name}" is out of stock (Only ${product.stock} left).`);
      }

      await conn.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.id]
      );

      totalPrice += item.totalPrice;
    }

    const guestName = !userId ? (customerName || "Walk-in Guest") : null;

    const [orderResult] = await conn.query<ResultSetHeader>(
      "INSERT INTO orders (user_id, customer_name, status, total_price) VALUES (?, ?, 'pending', ?)",
      [userId, guestName, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const pricePerUnit = item.totalPrice / item.quantity;

      await conn.query<ResultSetHeader>(
        "INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, sub_total, options_json) VALUES (?, ?, ?, ?, ?, ?)",
        [
          orderId,
          item.id,
          item.quantity,
          pricePerUnit,
          item.totalPrice,
          JSON.stringify(item.selectedOptions),
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: "Order placed successfully.",
      order: { id: orderId, total_price: totalPrice, status: "pending" },
    });

  } catch (error: any) {
    if (conn) await conn.rollback();
    console.error("Create order error:", error);

    res.status(400).json({ message: error.message || "Internal server error." });
  } finally {
    if (conn) conn.release();
  }
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as jwt.JwtPayload;
    const pool = getPool();

    const [orders] = await pool.query<OrderRow[]>(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query<OrderItemRow[]>(
          `SELECT oi.*, p.name AS product_name, p.image_url AS product_image
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return { ...order, items };
      })
    );

    res.status(200).json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();

    const [orders] = await pool.query<OrderRow[]>(
      `SELECT o.*, u.username, COALESCE(u.username, o.customer_name, 'Guest') AS display_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query<OrderItemRow[]>(
          `SELECT oi.*, p.name AS product_name, p.image_url AS product_image
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return { ...order, items };
      })
    );

    res.status(200).json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }

    const pool = getPool();

    const [existing] = await pool.query<OrderRow[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );

    const [updated] = await pool.query<OrderRow[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    res.status(200).json({ message: "Order status updated.", order: updated[0] });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}