import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ConflictError, UnauthorizedError, NotFoundError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "coffee_shop_jwt_secret_key_change_in_production";
const SALT_ROUNDS = 10;

interface UserRow extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
    role: "admin" | "customer";
    created_at?: string;
}

export async function registerUser(username: string, password: string) {
    const pool = getPool();

    const [existing] = await pool.query<UserRow[]>(
        "SELECT id FROM users WHERE username = ?",
        [username]
    );

    if (existing.length > 0) {
        throw new ConflictError("Username already exists.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userRole = "customer";

    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        [username, passwordHash, userRole]
    );

    const token = jwt.sign(
        { id: result.insertId, username, role: userRole },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    return {
        token,
        user: { id: result.insertId, username, role: userRole },
    };
}

export async function loginUser(username: string, password: string) {
    const pool = getPool();

    const [rows] = await pool.query<UserRow[]>(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );

    if (rows.length === 0) {
        throw new UnauthorizedError("Invalid username or password.");
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new UnauthorizedError("Invalid username or password.");
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    return {
        token,
        user: { id: user.id, username: user.username, role: user.role },
    };
}

export async function getUserProfile(userId: number) {
    const pool = getPool();

    const [rows] = await pool.query<UserRow[]>(
        "SELECT id, username, role, created_at FROM users WHERE id = ?",
        [userId]
    );

    if (rows.length === 0) {
        throw new NotFoundError("User");
    }

    return rows[0];
}
