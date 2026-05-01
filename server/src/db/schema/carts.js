const {
  pgTable,
  serial,
  integer,
  numeric,
  timestamp,
  unique,
} = require('drizzle-orm/pg-core');
const { users } = require('./users');
const { products } = require('./products');

const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull().default('0'),
  totalItems: integer('total_items').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [unique('cart_item_product').on(table.cartId, table.productId)]
);

module.exports = { carts, cartItems };
