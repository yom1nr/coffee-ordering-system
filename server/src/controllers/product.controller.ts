import { Request, Response } from "express";
import { getPool } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  base_price: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();
    const { category, includeInactive } = req.query;

    let sql = "SELECT * FROM products";
    const params: string[] = [];

    const conditions: string[] = [];

    if (!includeInactive) {
      conditions.push("is_active = true");
    }

    if (category && typeof category === "string") {
      conditions.push("category = ?");
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY category, name";

    const [rows] = await pool.query<ProductRow[]>(sql, params);

    res.status(200).json({ products: rows });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [rows] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.status(200).json({ product: rows[0] });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, base_price, image_url, category } = req.body;

    if (!name || base_price === undefined || !category) {
      res.status(400).json({ message: "Name, base_price, and category are required." });
      return;
    }

    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO products (name, base_price, image_url, category) VALUES (?, ?, ?, ?)",
      [name, base_price, image_url || null, category]
    );

    const [rows] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ message: "Product created successfully.", product: rows[0] });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, base_price, image_url, category, is_active } = req.body;

    const pool = getPool();

    const [existing] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    const updated = {
      name: name ?? existing[0].name,
      base_price: base_price ?? existing[0].base_price,
      image_url: image_url !== undefined ? image_url : existing[0].image_url,
      category: category ?? existing[0].category,
      is_active: is_active !== undefined ? is_active : existing[0].is_active,
    };

    await pool.query(
      "UPDATE products SET name = ?, base_price = ?, image_url = ?, category = ?, is_active = ? WHERE id = ?",
      [updated.name, updated.base_price, updated.image_url, updated.category, updated.is_active, id]
    );

    const [rows] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    res.status(200).json({ message: "Product updated successfully.", product: rows[0] });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    const pool = getPool();

    const [existing] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    if (hard === "true") {
      await pool.query("DELETE FROM products WHERE id = ?", [id]);
      res.status(200).json({ message: "Product permanently deleted." });
    } else {
      await pool.query("UPDATE products SET is_active = false WHERE id = ?", [id]);
      res.status(200).json({ message: "Product deactivated." });
    }
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
