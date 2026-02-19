import { getPool } from "../config/database";
import { RowDataPacket } from "mysql2";

export async function getDashboardStats() {
    const pool = getPool();

    const [revenueRows] = await pool.query<RowDataPacket[]>(
        `SELECT SUM(total_price) as totalRevenue 
     FROM orders 
     WHERE status IN ('approved', 'completed')`
    );

    const [ordersRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as totalOrders 
     FROM orders 
     WHERE status != 'cancelled'`
    );

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

    return {
        totalRevenue: Number(revenueRows[0].totalRevenue || 0),
        totalOrders: Number(ordersRows[0].totalOrders || 0),
        popularMenu: bestSellerRows.length > 0 ? bestSellerRows[0].name : "-",
    };
}
