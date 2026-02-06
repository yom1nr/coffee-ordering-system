import mysql from "mysql2/promise";

let pool: mysql.Pool;

export async function connectDatabase(): Promise<mysql.Pool> {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "test",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false 
       }
    });

    const connection = await pool.getConnection();
    console.log("Connected to MySQL database");
    connection.release();

    return pool;
  } catch (error) {
    console.error("Failed to connect to MySQL:", error);
    process.exit(1);
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDatabase() first.");
  }
  return pool;
}
