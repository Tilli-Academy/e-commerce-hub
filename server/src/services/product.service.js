const { eq, sql, and, gte, lte, desc, asc, count } = require('drizzle-orm');
const { getDB } = require('../db');
const { products, productImages, reviews } = require('../db/schema');
const { users } = require('../db/schema');
const { AppError } = require('../middleware/errorHandler');

/**
 * Attach images array to a product row and map id → _id.
 */
const formatProduct = (product, images = []) => ({
  ...product,
  _id: String(product.id),
  price: Number(product.price),
  ratings: Number(product.ratings),
  images,
});

const getProducts = async (query) => {
  const db = getDB();
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = query;

  const conditions = [];

  if (keyword) {
    conditions.push(
      sql`to_tsvector('english', coalesce(${products.name}, '') || ' ' || coalesce(${products.description}, '') || ' ' || coalesce(${products.brand}, '')) @@ plainto_tsquery('english', ${keyword})`
    );
  }

  if (category) {
    conditions.push(eq(products.category, category));
  }

  if (minPrice) {
    conditions.push(gte(products.price, String(minPrice)));
  }

  if (maxPrice) {
    conditions.push(lte(products.price, String(maxPrice)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sort options
  let orderBy;
  switch (sort) {
    case 'price_asc':
      orderBy = asc(products.price);
      break;
    case 'price_desc':
      orderBy = desc(products.price);
      break;
    case 'rating':
      orderBy = desc(products.ratings);
      break;
    case 'newest':
      orderBy = desc(products.createdAt);
      break;
    default:
      orderBy = desc(products.createdAt);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [productRows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderBy)
      .offset(skip)
      .limit(Number(limit)),
    db
      .select({ total: count() })
      .from(products)
      .where(whereClause),
  ]);

  // Fetch images for all returned products in one query
  let imagesMap = {};
  if (productRows.length > 0) {
    const productIds = productRows.map((p) => p.id);
    const allImages = await db
      .select()
      .from(productImages)
      .where(sql`${productImages.productId} IN ${productIds}`);

    for (const img of allImages) {
      if (!imagesMap[img.productId]) imagesMap[img.productId] = [];
      imagesMap[img.productId].push({ url: img.url, alt: img.alt });
    }
  }

  const formattedProducts = productRows.map((p) =>
    formatProduct(p, imagesMap[p.id] || [])
  );

  return {
    products: formattedProducts,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  };
};

const getProductById = async (id) => {
  const db = getDB();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Fetch images
  const images = await db
    .select({ url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(eq(productImages.productId, product.id));

  // Fetch reviews with user names
  const productReviews = await db
    .select({
      id: reviews.id,
      user: reviews.userId,
      name: reviews.name,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
    })
    .from(reviews)
    .where(eq(reviews.productId, product.id));

  const formattedReviews = productReviews.map((r) => ({
    ...r,
    _id: String(r.id),
  }));

  return {
    ...formatProduct(product, images),
    reviews: formattedReviews,
  };
};

const getCategories = async () => {
  const db = getDB();
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products);
  return rows.map((r) => r.category);
};

const createProduct = async (data, userId) => {
  const db = getDB();
  const { images, ...productData } = data;

  const [product] = await db
    .insert(products)
    .values({ ...productData, createdBy: userId })
    .returning();

  // Insert images if provided
  let insertedImages = [];
  if (images && images.length > 0) {
    insertedImages = await db
      .insert(productImages)
      .values(images.map((img) => ({ productId: product.id, ...img })))
      .returning();
  }

  return formatProduct(product, insertedImages.map((i) => ({ url: i.url, alt: i.alt })));
};

const updateProduct = async (id, data) => {
  const db = getDB();
  const { images, ...productData } = data;

  const updateData = { ...productData, updatedAt: new Date() };

  const [product] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, Number(id)))
    .returning();

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // If images are provided, replace them
  if (images) {
    await db
      .delete(productImages)
      .where(eq(productImages.productId, product.id));

    if (images.length > 0) {
      await db
        .insert(productImages)
        .values(images.map((img) => ({ productId: product.id, ...img })));
    }
  }

  // Fetch current images
  const currentImages = await db
    .select({ url: productImages.url, alt: productImages.alt })
    .from(productImages)
    .where(eq(productImages.productId, product.id));

  return formatProduct(product, currentImages);
};

const deleteProduct = async (id) => {
  const db = getDB();

  const [product] = await db
    .delete(products)
    .where(eq(products.id, Number(id)))
    .returning();

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

const createReview = async (productId, userId, userName, { rating, comment }) => {
  const db = getDB();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(productId)));

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if already reviewed (unique constraint will also catch this)
  const [existingReview] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      and(
        eq(reviews.productId, Number(productId)),
        eq(reviews.userId, userId)
      )
    );

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  await db.insert(reviews).values({
    productId: Number(productId),
    userId,
    name: userName,
    rating: Number(rating),
    comment,
  });

  // Recalculate ratings
  const [stats] = await db
    .select({
      avgRating: sql`ROUND(AVG(${reviews.rating})::numeric, 2)`,
      count: count(),
    })
    .from(reviews)
    .where(eq(reviews.productId, Number(productId)));

  await db
    .update(products)
    .set({
      ratings: stats.avgRating,
      numReviews: stats.count,
      updatedAt: new Date(),
    })
    .where(eq(products.id, Number(productId)));

  // Return full product with reviews
  return getProductById(productId);
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
};
