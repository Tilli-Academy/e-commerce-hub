const {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
} = require('drizzle-orm/pg-core');
const { users } = require('./users');

const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  stock: integer('stock').notNull().default(0),
  ratings: numeric('ratings', { precision: 3, scale: 2 }).notNull().default('0'),
  numReviews: integer('num_reviews').notNull().default(0),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  alt: varchar('alt', { length: 255 }).notNull().default(''),
});

module.exports = { products, productImages };
