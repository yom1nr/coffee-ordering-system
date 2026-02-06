import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

async function addStockColumn() {
  console.log('🔧 Starting database migration...');
  
  try {
    const pool = await connectDatabase();
    const connection = await pool.getConnection();

    console.log('📦 Adding "stock" column to products table...');
    
    // สั่งเพิ่มคอลัมน์ stock ถ้ายังไม่มี
    try {
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN stock INT DEFAULT 100
      `);
      console.log('✅ Successfully added "stock" column!');
    } catch (err: any) {
      // ถ้า Error แปลว่าอาจจะมีอยู่แล้ว
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️ "stock" column already exists (Skipping).');
      } else {
        throw err;
      }
    }

    connection.release();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addStockColumn();