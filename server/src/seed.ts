import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  // ═══════════════════════════════════════════
  //  ☕ HOT COFFEE
  // ═══════════════════════════════════════════
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
  {
    name: "Caramel Latte",
    category: "Hot Coffee",
    price: 95,
    stock: 80,
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Vanilla Latte",
    category: "Hot Coffee",
    price: 90,
    stock: 80,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hazelnut Latte",
    category: "Hot Coffee",
    price: 95,
    stock: 70,
    image: "https://images.unsplash.com/photo-1529892485617-25f63612c3f4?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Affogato",
    category: "Hot Coffee",
    price: 110,
    stock: 50,
    image: "https://images.unsplash.com/photo-1579888944880-d98341245702?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🧊 ICED COFFEE
  // ═══════════════════════════════════════════
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
  {
    name: "Iced Mocha",
    category: "Iced Coffee",
    price: 100,
    stock: 100,
    image: "https://images.unsplash.com/photo-1592663527359-cf6642f54cff?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Cold Brew",
    category: "Iced Coffee",
    price: 100,
    stock: 80,
    image: "https://images.unsplash.com/photo-1461023058943-48dbf1399cc9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Vanilla Latte",
    category: "Iced Coffee",
    price: 95,
    stock: 100,
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Hazelnut Latte",
    category: "Iced Coffee",
    price: 100,
    stock: 90,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🍵 TEA
  // ═══════════════════════════════════════════
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
    name: "Iced Lemon Tea",
    category: "Tea",
    price: 65,
    stock: 120,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Honey Lemon Tea",
    category: "Tea",
    price: 70,
    stock: 100,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Peach Tea",
    category: "Tea",
    price: 75,
    stock: 90,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Oolong Milk Tea",
    category: "Tea",
    price: 85,
    stock: 80,
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Earl Grey Latte",
    category: "Tea",
    price: 90,
    stock: 70,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Jasmine Milk Tea",
    category: "Tea",
    price: 80,
    stock: 80,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🥤 FRAPPE & BLENDED
  // ═══════════════════════════════════════════
  {
    name: "Mocha Frappe",
    category: "Frappe",
    price: 120,
    stock: 80,
    image: "https://images.unsplash.com/photo-1461023058943-48dbf1399cc9?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Caramel Frappe",
    category: "Frappe",
    price: 120,
    stock: 80,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Cookies & Cream Frappe",
    category: "Frappe",
    price: 130,
    stock: 60,
    image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Matcha Frappe",
    category: "Frappe",
    price: 125,
    stock: 70,
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd60bc51?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Strawberry Frappe",
    category: "Frappe",
    price: 115,
    stock: 70,
    image: "https://images.unsplash.com/photo-1497534446932-c925d0981900?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Chocolate Chip Frappe",
    category: "Frappe",
    price: 130,
    stock: 60,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🍓 SMOOTHIE & FRESH
  // ═══════════════════════════════════════════
  {
    name: "Mango Smoothie",
    category: "Smoothie",
    price: 95,
    stock: 80,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Mixed Berry Smoothie",
    category: "Smoothie",
    price: 100,
    stock: 70,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Banana Smoothie",
    category: "Smoothie",
    price: 85,
    stock: 90,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Strawberry Soda",
    category: "Smoothie",
    price: 70,
    stock: 100,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Lychee Soda",
    category: "Smoothie",
    price: 70,
    stock: 100,
    image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Passion Fruit Soda",
    category: "Smoothie",
    price: 75,
    stock: 90,
    image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🍫 CHOCOLATE & OTHER DRINKS
  // ═══════════════════════════════════════════
  {
    name: "Iced Cocoa",
    category: "Other Drinks",
    price: 80,
    stock: 100,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Hot Chocolate",
    category: "Other Drinks",
    price: 85,
    stock: 90,
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Iced Matcha Latte",
    category: "Other Drinks",
    price: 100,
    stock: 80,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Fresh Orange Juice",
    category: "Other Drinks",
    price: 75,
    stock: 60,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Sparkling Water",
    category: "Other Drinks",
    price: 45,
    stock: 200,
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🥐 BAKERY & PASTRY
  // ═══════════════════════════════════════════
  {
    name: "Croissant Butter",
    category: "Bakery",
    price: 85,
    stock: 30,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Almond Croissant",
    category: "Bakery",
    price: 110,
    stock: 25,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Ham & Cheese Croissant",
    category: "Bakery",
    price: 120,
    stock: 25,
    image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Chocolate Brownie",
    category: "Bakery",
    price: 90,
    stock: 40,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Blueberry Cheesecake",
    category: "Bakery",
    price: 140,
    stock: 20,
    image: "https://images.unsplash.com/photo-1567327613485-fbc7bf196198?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Tiramisu Cake",
    category: "Bakery",
    price: 150,
    stock: 15,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Banana Cake",
    category: "Bakery",
    price: 95,
    stock: 20,
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Cinnamon Roll",
    category: "Bakery",
    price: 85,
    stock: 30,
    image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Danish Pastry",
    category: "Bakery",
    price: 90,
    stock: 25,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Scone with Jam",
    category: "Bakery",
    price: 75,
    stock: 30,
    image: "https://images.unsplash.com/photo-1558303087-732c04768e04?auto=format&fit=crop&w=600&q=80"
  },

  // ═══════════════════════════════════════════
  //  🍕 FOOD & SNACKS
  // ═══════════════════════════════════════════
  {
    name: "Club Sandwich",
    category: "Food",
    price: 150,
    stock: 30,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Tuna Sandwich",
    category: "Food",
    price: 130,
    stock: 30,
    image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Grilled Cheese Sandwich",
    category: "Food",
    price: 120,
    stock: 30,
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Egg Benedict",
    category: "Food",
    price: 180,
    stock: 20,
    image: "https://images.unsplash.com/photo-1608039829572-9b0e5c6eb20f?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Caesar Salad",
    category: "Food",
    price: 160,
    stock: 25,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "French Fries",
    category: "Food",
    price: 80,
    stock: 50,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Chicken Wings",
    category: "Food",
    price: 140,
    stock: 30,
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Waffle with Ice Cream",
    category: "Food",
    price: 135,
    stock: 25,
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Pancake Stack",
    category: "Food",
    price: 130,
    stock: 25,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Toast with Avocado",
    category: "Food",
    price: 140,
    stock: 20,
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80"
  },
];

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log(`📦 Total products to seed: ${products.length}`);

  try {
    const pool = await connectDatabase();
    const connection = await pool.getConnection();

    // ล้างข้อมูลสินค้าเก่า (ระวัง: จะลบ order_items ที่ reference ด้วย!)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Cleared old data');

    for (const product of products) {
      await connection.query(
        `INSERT INTO products (name, category, base_price, stock, image_url, is_active) 
         VALUES (?, ?, ?, ?, ?, true)`,
        [product.name, product.category, product.price, product.stock, product.image]
      );
      console.log(`✅ Added: ${product.name}`);
    }

    // สรุปจำนวนตาม category
    const [categories] = await connection.query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category'
    );
    console.log('\n📊 Summary by category:');
    (categories as any[]).forEach((c: any) => console.log(`   ${c.category}: ${c.count} items`));

    console.log(`\n✨ Seed completed! Total: ${products.length} products`);
    connection.release();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();