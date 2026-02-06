import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const JWT_SECRET = process.env.JWT_SECRET || "coffee_shop_jwt_secret_key_change_in_production";
const SALT_ROUNDS = 10;

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  role: "admin" | "customer";
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const pool = getPool();

    const [existing] = await pool.query<UserRow[]>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      res.status(409).json({ message: "Username already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = role === "admin" ? "admin" : "customer";

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
      [username, passwordHash, userRole]
    );

    const token = jwt.sign(
      { id: result.insertId, username, role: userRole },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: { id: result.insertId, username, role: userRole },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const pool = getPool();

    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      res.status(401).json({ message: "Invalid username or password." });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid username or password." });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.user as jwt.JwtPayload;

    const pool = getPool();
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [payload.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
