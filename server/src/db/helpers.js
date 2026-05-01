const { eq, sql } = require('drizzle-orm');
const { getDB } = require('./index');
const { carts, cartItems } = require('./schema');
const { products, productImages } = require('./schema');

/**
 * Reconstruct the nested shippingAddress object from flat order columns.
 * Ensures frontend receives the same shape as the Mongoose version.
 */
const formatOrderResponse = (order) => {
  const {
    shippingFullName,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZipCode,
    shippingCountry,
    shippingPhone,
    itemsPrice,
    shippingPrice,
    totalPrice,
    ...rest
  } = order;

  return {
    ...rest,
    _id: String(order.id),
    itemsPrice: Number(itemsPrice),
    shippingPrice: Number(shippingPrice),
    totalPrice: Number(totalPrice),
    shippingAddress: {
      fullName: shippingFullName,
      address: shippingAddress,
      city: shippingCity,
      state: shippingState,
      zipCode: shippingZipCode,
      country: shippingCountry,
      phone: shippingPhone,
    },
  };
};

/**
 * Recalculate cart totals from its items and update the cart row.
 * Replaces Mongoose pre-save hook.
 */
const recalcCartTotals = async (cartId) => {
  const db = getDB();

  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  await db
    .update(carts)
    .set({
      totalItems,
      totalPrice: totalPrice.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));
};

/**
 * Fetch a cart with its items and populated product data.
 * Replaces Mongoose .populate('items.product').
 */
const fetchCartWithItems = async (cartId) => {
  const db = getDB();

  const [cart] = await db.select().from(carts).where(eq(carts.id, cartId));
  if (!cart) return null;

  const items = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      price: cartItems.price,
      product: {
        id: products.id,
        name: products.name,
        images: sql`(
          SELECT coalesce(json_agg(json_build_object('url', pi.url, 'alt', pi.alt)), '[]'::json)
          FROM product_images pi
          WHERE pi.product_id = ${products.id}
        )`,
        stock: products.stock,
        price: products.price,
      },
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  const formattedItems = items.map((item) => ({
    _id: String(item.id),
    product: item.product
      ? {
          _id: String(item.product.id),
          name: item.product.name,
          images: item.product.images,
          stock: item.product.stock,
          price: Number(item.product.price),
        }
      : null,
    quantity: item.quantity,
    price: Number(item.price),
  }));

  return {
    _id: String(cart.id),
    user: cart.userId,
    items: formattedItems,
    totalPrice: Number(cart.totalPrice),
    totalItems: cart.totalItems,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

module.exports = { formatOrderResponse, recalcCartTotals, fetchCartWithItems };
