const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  unique,
} = require('drizzle-orm/pg-core');
const { products } = require('./products');
const { users } = require('./users');

const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('review_user_product').on(table.productId, table.userId)]
);

module.exports = { reviews };
