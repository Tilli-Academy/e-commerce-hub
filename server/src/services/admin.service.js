const { eq, ne, desc, sql, count, sum } = require('drizzle-orm');
const { getDB } = require('../db');
const { users, products, orders, orderItems } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');
const { formatOrderResponse } = require('../db/helpers');

const getDashboardStats = async () => {
  const db = getDB();

  const [
    [{ totalUsers }],
    [{ totalProducts }],
    [{ totalOrders }],
    [{ revenue }],
    recentOrderRows,
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(users),
    db.select({ totalProducts: count() }).from(products),
    db.select({ totalOrders: count() }).from(orders),
    db
      .select({ revenue: sql`coalesce(SUM(${orders.totalPrice}::numeric), 0)` })
      .from(orders)
      .where(ne(orders.status, 'cancelled')),
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
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  // Orders by status
  const statusRows = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.status);

  const ordersByStatus = {};
  for (const entry of statusRows) {
    ordersByStatus[entry.status] = entry.count;
  }

  // Format recent orders
  const recentOrders = await Promise.all(
    recentOrderRows.map(async (row) => {
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
    totalUsers,
    totalProducts,
    totalOrders,
    revenue: Number(revenue),
    ordersByStatus,
    recentOrders,
  };
};

const getUsers = async ({ page = 1, limit = 20 }) => {
  const db = getDB();
  const skip = (Number(page) - 1) * Number(limit);

  const [userRows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .offset(skip)
      .limit(Number(limit)),
    db.select({ total: count() }).from(users),
  ]);

  const formattedUsers = userRows.map((u) => ({
    _id: String(u.id),
    ...u,
  }));

  return {
    users: formattedUsers,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  };
};

const updateUserRole = async (userId, role) => {
  const db = getDB();

  const [user] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, Number(userId)))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const deleteUser = async (userId, adminId) => {
  if (Number(userId) === adminId) {
    throw new AppError('Cannot delete your own account', 400);
  }

  const db = getDB();

  const [user] = await db
    .delete(users)
    .where(eq(users.id, Number(userId)))
    .returning();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

module.exports = { getDashboardStats, getUsers, updateUserRole, deleteUser };
