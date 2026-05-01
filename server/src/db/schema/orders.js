const {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  boolean,
  timestamp,
} = require('drizzle-orm/pg-core');
const { users } = require('./users');
const { products } = require('./products');

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull().default('cod'),
  itemsPrice: numeric('items_price', { precision: 10, scale: 2 }).notNull(),
  shippingPrice: numeric('shipping_price', { precision: 10, scale: 2 }).notNull().default('0'),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  // Flattened shipping address
  shippingFullName: varchar('shipping_full_name', { length: 100 }).notNull(),
  shippingAddress: varchar('shipping_address', { length: 255 }).notNull(),
  shippingCity: varchar('shipping_city', { length: 100 }).notNull(),
  shippingState: varchar('shipping_state', { length: 100 }).notNull(),
  shippingZipCode: varchar('shipping_zip_code', { length: 20 }).notNull(),
  shippingCountry: varchar('shipping_country', { length: 100 }).notNull(),
  shippingPhone: varchar('shipping_phone', { length: 30 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 200 }).notNull(),
  image: varchar('image', { length: 500 }).notNull().default(''),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
});

module.exports = { orders, orderItems };
