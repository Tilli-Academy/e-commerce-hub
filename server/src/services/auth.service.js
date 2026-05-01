const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
const { getDB } = require('../db');
const { users } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');

const register = async ({ name, email, password }) => {
  const db = getDB();

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await db
    .update(users)
    .set({ refreshToken })
    .where(eq(users.id, user.id));

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const login = async ({ email, password }) => {
  const db = getDB();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await db
    .update(users)
    .set({ refreshToken })
    .where(eq(users.id, user.id));

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refresh = async (token) => {
  if (!token) {
    throw new AppError('Refresh token not provided', 401);
  }

  const decoded = verifyRefreshToken(token);
  const db = getDB();

  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      refreshToken: users.refreshToken,
    })
    .from(users)
    .where(eq(users.id, decoded.id));

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  await db
    .update(users)
    .set({ refreshToken: newRefreshToken })
    .where(eq(users.id, user.id));

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  const db = getDB();
  await db
    .update(users)
    .set({ refreshToken: null })
    .where(eq(users.id, userId));
};

const getProfile = async (userId) => {
  const db = getDB();

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

module.exports = { register, login, refresh, logout, getProfile };
