const { eq, and } = require('drizzle-orm');
const { getDB } = require('../db');
const { carts, cartItems } = require('../db/schema');
const { products } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');
const { recalcCartTotals, fetchCartWithItems } = require('../db/helpers');

const getCart = async (userId) => {
  const db = getDB();

  let [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) {
    [cart] = await db
      .insert(carts)
      .values({ userId })
      .returning();
  }

  return fetchCartWithItems(cart.id);
};

const addToCart = async (userId, productId, quantity = 1) => {
  const db = getDB();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(productId)));

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Get or create cart
  let [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) {
    [cart] = await db
      .insert(carts)
      .values({ userId })
      .returning();
  }

  // Check if product already in cart
  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, Number(productId))
      )
    );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      throw new AppError('Insufficient stock for requested quantity', 400);
    }
    await db
      .update(cartItems)
      .set({ quantity: newQty, price: product.price })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productId: Number(productId),
      quantity,
      price: product.price,
    });
  }

  await recalcCartTotals(cart.id);
  return fetchCartWithItems(cart.id);
};

const updateCartItem = async (userId, itemId, quantity) => {
  const db = getDB();

  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const [item] = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.id, Number(itemId)), eq(cartItems.cartId, cart.id))
    );

  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, item.productId));

  if (!product) {
    throw new AppError('Product no longer available', 404);
  }

  if (quantity > product.stock) {
    throw new AppError('Insufficient stock', 400);
  }

  await db
    .update(cartItems)
    .set({ quantity, price: product.price })
    .where(eq(cartItems.id, item.id));

  await recalcCartTotals(cart.id);
  return fetchCartWithItems(cart.id);
};

const removeCartItem = async (userId, itemId) => {
  const db = getDB();

  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const [item] = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.id, Number(itemId)), eq(cartItems.cartId, cart.id))
    );

  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  await db.delete(cartItems).where(eq(cartItems.id, item.id));

  await recalcCartTotals(cart.id);
  return fetchCartWithItems(cart.id);
};

const clearCart = async (userId) => {
  const db = getDB();

  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) return;

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await recalcCartTotals(cart.id);

  return fetchCartWithItems(cart.id);
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
