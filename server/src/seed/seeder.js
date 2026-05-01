const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { initDB, closeDB, getDB } = require('../db');
const { users, products, productImages } = require('../db/schema');
const seedProducts = require('./products');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://shophub:shophub_secret@localhost:5433/ecommerce';

const seed = async () => {
  try {
    await initDB(DATABASE_URL);
    const db = getDB();
    console.log('Connected to PostgreSQL');

    // Find or create an admin user
    let [admin] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      [admin] = await db
        .insert(users)
        .values({
          name: 'Admin',
          email: 'admin@shophub.com',
          password: hashedPassword,
          role: 'admin',
        })
        .returning();
      console.log('Admin user created (admin@shophub.com / admin123)');
    }

    // Clear existing products (cascade deletes images, reviews)
    await db.delete(products);
    console.log('Existing products cleared');

    // Seed products
    for (const p of seedProducts) {
      const { images, ...productData } = p;

      const [inserted] = await db
        .insert(products)
        .values({
          ...productData,
          createdBy: admin.id,
        })
        .returning();

      // Insert images
      if (images && images.length > 0) {
        await db.insert(productImages).values(
          images.map((img) => ({
            productId: inserted.id,
            url: img.url,
            alt: img.alt || '',
          }))
        );
      }
    }

    console.log(`${seedProducts.length} products seeded successfully`);

    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
