import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

async function createGuestUser() {
  console.log('👤 Creating Guest User...');
  try {
    const pool = await connectDatabase();
    const connection = await pool.getConnection();

    // สร้าง User ID 9999 (ถ้ามีแล้วจะข้ามไป)
    try {
      await connection.query(`
        INSERT INTO users (id, username, password_hash, role) 
        VALUES (9999, 'Guest Customer', 'nopassword', 'customer')
      `);
      console.log('✅ Guest User (ID 9999) created successfully!');
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('⚠️ Guest User already exists. Good to go!');
      } else {
        throw err;
      }
    }

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createGuestUser();