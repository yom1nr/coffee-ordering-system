import { Request, Response } from "express";
import { getPool } from "../config/database";
import { RowDataPacket } from "mysql2";

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();

    // 1. หา Total Revenue (ยอดขายรวมเฉพาะออเดอร์ที่เสร็จแล้ว/อนุมัติแล้ว)
    const [revenueRows] = await pool.query<RowDataPacket[]>(
      `SELECT SUM(total_price) as totalRevenue 
       FROM orders 
       WHERE status IN ('approved', 'completed')`
    );

    // 2. หา Total Orders (จำนวนออเดอร์ทั้งหมด ไม่นับที่ยกเลิก)
    const [ordersRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as totalOrders 
       FROM orders 
       WHERE status != 'cancelled'`
    );

    // 3. หา Best Seller (สินค้าที่ขายดีที่สุด)
    const [bestSellerRows] = await pool.query<RowDataPacket[]>(
      `SELECT p.name, SUM(oi.quantity) as totalQty
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY p.id
       ORDER BY totalQty DESC
       LIMIT 1`
    );

    const totalRevenue = revenueRows[0].totalRevenue || 0;
    const totalOrders = ordersRows[0].totalOrders || 0;
    const popularMenu = bestSellerRows.length > 0 ? bestSellerRows[0].name : "-";

    res.json({
      totalRevenue: Number(totalRevenue),
      totalOrders: Number(totalOrders),
      popularMenu,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}