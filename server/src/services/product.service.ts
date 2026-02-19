import { getPool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NotFoundError } from "../utils/AppError";
import { PaginationParams, buildPaginationMeta } from "../utils/pagination";

interface ProductRow extends RowDataPacket {
    id: number;
    name: string;
    base_price: number;
    image_url: string | null;
    category: string;
    stock: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface GetAllProductsOptions {
    category?: string;
    includeInactive?: boolean;
    pagination?: PaginationParams;
}

export async function getAllProducts(options: GetAllProductsOptions = {}) {
    const pool = getPool();
    const { category, includeInactive, pagination } = options;

    const conditions: string[] = [];
    const params: any[] = [];

    if (!includeInactive) {
        conditions.push("is_active = true");
    }

    if (category) {
        conditions.push("category = ?");
        params.push(category);
    }

    const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

    if (pagination) {
        const [countRows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) as total FROM products${whereClause}`,
            params
        );
        const total = countRows[0].total;

        const [rows] = await pool.query<ProductRow[]>(
            `SELECT * FROM products${whereClause} ORDER BY category, name LIMIT ? OFFSET ?`,
            [...params, pagination.limit, pagination.offset]
        );

        const meta = buildPaginationMeta(total, pagination);
        return { products: rows, meta };
    }

    const [rows] = await pool.query<ProductRow[]>(
        `SELECT * FROM products${whereClause} ORDER BY category, name`,
        params
    );

    return { products: rows };
}

export async function getProductById(id: string) {
    const pool = getPool();

    const [rows] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    if (rows.length === 0) {
        throw new NotFoundError("Product");
    }

    return rows[0];
}

export async function createProduct(data: {
    name: string;
    base_price: number;
    image_url?: string | null;
    category: string;
}) {
    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO products (name, base_price, image_url, category) VALUES (?, ?, ?, ?)",
        [data.name, data.base_price, data.image_url || null, data.category]
    );

    const [rows] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?",
        [result.insertId]
    );

    return rows[0];
}

export async function updateProduct(
    id: string,
    data: Partial<{
        name: string;
        base_price: number;
        image_url: string | null;
        category: string;
        is_active: boolean;
    }>
) {
    const pool = getPool();

    const [existing] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    if (existing.length === 0) {
        throw new NotFoundError("Product");
    }

    const updated = {
        name: data.name ?? existing[0].name,
        base_price: data.base_price ?? existing[0].base_price,
        image_url: data.image_url !== undefined ? data.image_url : existing[0].image_url,
        category: data.category ?? existing[0].category,
        is_active: data.is_active !== undefined ? data.is_active : existing[0].is_active,
    };

    await pool.query(
        "UPDATE products SET name = ?, base_price = ?, image_url = ?, category = ?, is_active = ? WHERE id = ?",
        [updated.name, updated.base_price, updated.image_url, updated.category, updated.is_active, id]
    );

    const [rows] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    return rows[0];
}

export async function deleteProduct(id: string, hard = false) {
    const pool = getPool();

    const [existing] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?",
        [id]
    );

    if (existing.length === 0) {
        throw new NotFoundError("Product");
    }

    if (hard) {
        await pool.query("DELETE FROM products WHERE id = ?", [id]);
        return { message: "Product permanently deleted." };
    }

    await pool.query("UPDATE products SET is_active = false WHERE id = ?", [id]);
    return { message: "Product deactivated." };
}
