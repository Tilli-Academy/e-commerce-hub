const { eq, and, desc, sql, count, ne } = require('drizzle-orm');
const { getDB } = require('../db');
const { orders, orderItems } = require('../db/schema');
const { carts, cartItems } = require('../db/schema');
const { products, productImages } = require('../db/schema');
const { users } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');
const { formatOrderResponse } = require('../db/helpers');

const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 10;

const placeOrder = async (userId, { shippingAddress, paymentMethod }) => {
  const db = getDB();

  // Get cart with items + product data
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId));

  if (!cart) {
    throw new AppError('Cart is empty', 400);
  }

  const items = await db
    .select({
      cartItemId: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      productName: products.name,
      productPrice: products.price,
      productStock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  if (items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Validate stock and build order items
  const orderItemsData = [];
  for (const item of items) {
    if (item.productStock < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${item.productName}". Available: ${item.productStock}`,
        400
      );
    }

    // Get first image
    const [img] = await db
      .select({ url: productImages.url })
      .from(productImages)
      .where(eq(productImages.productId, item.productId))
      .limit(1);

    orderItemsData.push({
      productId: item.productId,
      name: item.productName,
      image: img?.url || '',
      price: item.productPrice,
      quantity: item.quantity,
    });
  }

  const itemsPrice = orderItemsData.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalPrice = itemsPrice + shippingPrice;

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      userId,
      paymentMethod,
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      isPaid: paymentMethod !== 'cod',
      paidAt: paymentMethod !== 'cod' ? new Date() : null,
      shippingFullName: shippingAddress.fullName,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state,
      shippingZipCode: shippingAddress.zipCode,
      shippingCountry: shippingAddress.country,
      shippingPhone: shippingAddress.phone,
    })
    .returning();

  // Insert order items
  const insertedItems = await db
    .insert(orderItems)
    .values(
      orderItemsData.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }))
    )
    .returning();

  // Deduct stock
  for (const item of orderItemsData) {
    await db
      .update(products)
      .set({
        stock: sql`${products.stock} - ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(products.id, item.productId));
  }

  // Clear cart
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db
    .update(carts)
    .set({ totalItems: 0, totalPrice: '0', updatedAt: new Date() })
    .where(eq(carts.id, cart.id));

  const formattedItems = insertedItems.map((item) => ({
    _id: String(item.id),
    product: item.productId,
    name: item.name,
    image: item.image,
    price: Number(item.price),
    quantity: item.quantity,
  }));

  return {
    ...formatOrderResponse(order),
    items: formattedItems,
  };
};

const getUserOrders = async (userId, { page = 1, limit = 10 }) => {
  const db = getDB();
  const skip = (Number(page) - 1) * Number(limit);

  const [orderRows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .offset(skip)
      .limit(Number(limit)),
    db
      .select({ total: count() })
      .from(orders)
      .where(eq(orders.userId, userId)),
  ]);

  // Fetch items for all orders
  const result = await Promise.all(
    orderRows.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return {
        ...formatOrderResponse(order),
        items: items.map((item) => ({
          _id: String(item.id),
          product: item.productId,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      };
    })
  );

  return {
    orders: result,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  };
};

const getOrderById = async (orderId, userId, isAdmin) => {
  const db = getDB();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(orderId)));

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Get user info
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, order.userId));

  // Non-admin users can only view their own orders
  if (!isAdmin && order.userId !== userId) {
    throw new AppError('Not authorized to view this order', 403);
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return {
    ...formatOrderResponse(order),
    user: user ? { _id: String(user.id), name: user.name, email: user.email } : null,
    items: items.map((item) => ({
      _id: String(item.id),
      product: item.productId,
      name: item.name,
      image: item.image,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  };
};

const getAllOrders = async ({ page = 1, limit = 20, status }) => {
  const db = getDB();
  const skip = (Number(page) - 1) * Number(limit);

  const conditions = [];
  if (status) {
    conditions.push(eq(orders.status, status));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [orderRows, [{ total }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        userId: orders.userId,
        paymentMethod: orders.paymentMethod,
        itemsPrice: orders.itemsPrice,
        shippingPrice: orders.shippingPrice,
        totalPrice: orders.totalPrice,
        status: orders.status,
        isPaid: orders.isPaid,
        paidAt: orders.paidAt,
        deliveredAt: orders.deliveredAt,
        shippingFullName: orders.shippingFullName,
        shippingAddress: orders.shippingAddress,
        shippingCity: orders.shippingCity,
        shippingState: orders.shippingState,
        shippingZipCode: orders.shippingZipCode,
        shippingCountry: orders.shippingCountry,
        shippingPhone: orders.shippingPhone,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .offset(skip)
      .limit(Number(limit)),
    db.select({ total: count() }).from(orders).where(whereClause),
  ]);

  const result = await Promise.all(
    orderRows.map(async (row) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, row.id));

      const { userName, userEmail, ...orderData } = row;

      return {
        ...formatOrderResponse(orderData),
        user: { _id: String(row.userId), name: userName, email: userEmail },
        items: items.map((item) => ({
          _id: String(item.id),
          product: item.productId,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      };
    })
  );

  return {
    orders: result,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  };
};

const updateOrderStatus = async (orderId, status) => {
  const db = getDB();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(orderId)));

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const updateData = { status, updatedAt: new Date() };

  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
    updateData.isPaid = true;
    if (!order.paidAt) updateData.paidAt = new Date();
  }

  if (status === 'cancelled') {
    // Restore stock
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      if (item.productId) {
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }
  }

  const [updated] = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, Number(orderId)))
    .returning();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, updated.id));

  return {
    ...formatOrderResponse(updated),
    items: items.map((item) => ({
      _id: String(item.id),
      product: item.productId,
      name: item.name,
      image: item.image,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  };
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
