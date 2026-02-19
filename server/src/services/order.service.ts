import jwt from "jsonwebtoken";
import { getPool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { AppError, NotFoundError } from "../utils/AppError";
import { PaginationParams, buildPaginationMeta } from "../utils/pagination";

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

export async function createOrder(
    userId: number | null,
    items: CartItemPayload[],
    customerName?: string
) {
    const pool = getPool();
    let conn: PoolConnection | undefined;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        let totalPrice = 0;

        for (const item of items) {
            const [productRows] = await conn.query<RowDataPacket[]>(
                "SELECT stock, name FROM products WHERE id = ?",
                [item.id]
            );

            if (productRows.length === 0) {
                throw new NotFoundError(`Product ID ${item.id}`);
            }

            const product = productRows[0];

            if (product.stock < item.quantity) {
                throw new AppError(
                    `Sorry, "${product.name}" is out of stock (Only ${product.stock} left).`,
                    400
                );
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
                [orderId, item.id, item.quantity, pricePerUnit, item.totalPrice, JSON.stringify(item.selectedOptions)]
            );
        }

        await conn.commit();

        return { id: orderId, total_price: totalPrice, status: "pending" };
    } catch (error) {
        if (conn) await conn.rollback();
        throw error;
    } finally {
        if (conn) conn.release();
    }
}

export async function getMyOrders(userId: number) {
    const pool = getPool();

    const [orders] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
    );

    return attachItemsToOrders(orders);
}

export async function getAllOrders(pagination?: PaginationParams) {
    const pool = getPool();

    if (pagination) {
        const [countRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as total FROM orders"
        );
        const total = countRows[0].total;

        const [orders] = await pool.query<OrderRow[]>(
            `SELECT o.*, u.username, COALESCE(u.username, o.customer_name, 'Guest') AS display_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
            [pagination.limit, pagination.offset]
        );

        const ordersWithItems = await attachItemsToOrders(orders);
        const meta = buildPaginationMeta(total, pagination);
        return { orders: ordersWithItems, meta };
    }

    const [orders] = await pool.query<OrderRow[]>(
        `SELECT o.*, u.username, COALESCE(u.username, o.customer_name, 'Guest') AS display_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
    );

    return { orders: await attachItemsToOrders(orders) };
}

export async function updateOrderStatus(orderId: string, status: string) {
    const pool = getPool();

    const [existing] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
    );

    if (existing.length === 0) {
        throw new NotFoundError("Order");
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

    const [updated] = await pool.query<OrderRow[]>(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
    );

    return updated[0];
}

async function attachItemsToOrders(orders: OrderRow[]) {
    const pool = getPool();

    return Promise.all(
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
}
