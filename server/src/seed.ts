import { connectDatabase } from './config/database'; // เปลี่ยนจาก import pool เป็น connectDatabase
import dotenv from 'dotenv';

dotenv.config();

const products = [
  // --- Hot Coffee ---
  {
    name: "Espresso Perfetto",
    category: "Hot Coffee",
    price: 60,
    stock: 100,
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hot Americano",
    category: "Hot Coffee",
    price: 70,
    stock: 100,
    image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hot Latte",
    category: "Hot Coffee",
    price: 80,
    stock: 100,
    image: "https://images.unsplash.com/photo-1561882468-4141d3c26028?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hot Cappuccino",
    category: "Hot Coffee",
    price: 85,
    stock: 100,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Flat White",
    category: "Hot Coffee",
    price: 90,
    stock: 80,
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hot Mocha",
    category: "Hot Coffee",
    price: 95,
    stock: 90,
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80"
  },

  // --- Iced Coffee ---
  {
    name: "Iced Americano",
    category: "Iced Coffee",
    price: 80,
    stock: 150,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Latte",
    category: "Iced Coffee",
    price: 90,
    stock: 150,
    image: "https://images.unsplash.com/photo-1461023058943-48dbf1399cc9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Caramel Macchiato",
    category: "Iced Coffee",
    price: 110,
    stock: 120,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Dirty Coffee",
    category: "Iced Coffee",
    price: 120,
    stock: 50,
    image: "https://images.unsplash.com/photo-1525351463629-48bf18635417?auto=format&fit=crop&w=600&q=80"
  },

  // --- Tea & Non-Coffee ---
  {
    name: "Matcha Green Tea",
    category: "Tea",
    price: 95,
    stock: 80,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Thai Tea Premium",
    category: "Tea",
    price: 75,
    stock: 100,
    image: "https://images.unsplash.com/photo-1596711682306-c875d9e575cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Cocoa",
    category: "Other",
    price: 80,
    stock: 100,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Strawberry Soda",
    category: "Other",
    price: 70,
    stock: 100,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },

  // --- Bakery ---
  {
    name: "Croissant Butter",
    category: "Bakery",
    price: 85,
    stock: 30,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Blueberry Cheesecake",
    category: "Bakery",
    price: 140,
    stock: 20,
    image: "https://images.unsplash.com/photo-1567327613485-fbc7bf196198?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Chocolate Brownie",
    category: "Bakery",
    price: 90,
    stock: 40,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Tiramisu Cake",
    category: "Bakery",
    price: 150,
    stock: 15,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Almond Croissant",
    category: "Bakery",
    price: 110,
    stock: 25,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
  }
];

async function seed() {
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. เรียก connectDatabase() ก่อน เพื่อให้ได้ pool กลับมา
    const pool = await connectDatabase();

    const connection = await pool.getConnection();

    // 2. ล้างข้อมูลเก่า (Optional)
    // await connection.query('DELETE FROM products');

    for (const product of products) {
      // 3. ยิงข้อมูลเข้า DB
      await connection.query(
        `INSERT INTO products (name, category, base_price, stock, image_url, is_active) 
         VALUES (?, ?, ?, ?, ?, true)`,
        [product.name, product.category, product.price, product.stock, product.image]
      );
      console.log(`✅ Added: ${product.name}`);
    }

    console.log('✨ Seed completed successfully!');
    connection.release();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();