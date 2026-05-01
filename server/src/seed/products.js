const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description:
      'Premium noise-cancelling wireless headphones with 30-hour battery life, deep bass, and comfortable over-ear design. Perfect for music, calls, and travel.',
    price: 79.99,
    category: 'Electronics',
    brand: 'SoundMax',
    stock: 50,
    images: [
      { url: './images/products/headphones.jpg', alt: 'Wireless Headphones' },
    ],
    ratings: 4.5,
    numReviews: 12,
  },
  {
    name: 'Smart Watch Pro',
    description:
      'Feature-packed smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery. Water-resistant up to 50 meters.',
    price: 199.99,
    category: 'Electronics',
    brand: 'TechFit',
    stock: 30,
    images: [
      { url: './images/products/smartwatch.jpg', alt: 'Smart Watch' },
    ],
    ratings: 4.2,
    numReviews: 8,
  },
  {
    name: "Men's Classic Fit Cotton Shirt",
    description:
      'Comfortable 100% cotton shirt with a classic fit. Breathable fabric ideal for everyday wear or business casual settings.',
    price: 34.99,
    category: 'Clothing',
    brand: 'UrbanStyle',
    stock: 120,
    images: [
      { url: './images/products/shirt.jpg', alt: 'Cotton Shirt' },
    ],
    ratings: 4.0,
    numReviews: 25,
  },
  {
    name: "Women's Running Shoes",
    description:
      'Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for comfort during long runs.',
    price: 89.99,
    category: 'Sports',
    brand: 'RunElite',
    stock: 75,
    images: [
      { url: './images/products/running-shoes.jpg', alt: 'Running Shoes' },
    ],
    ratings: 4.7,
    numReviews: 42,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description:
      'Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, 750ml capacity.',
    price: 24.99,
    category: 'Sports',
    brand: 'HydroKeep',
    stock: 200,
    images: [
      { url: './images/products/water-bottle.jpg', alt: 'Water Bottle' },
    ],
    ratings: 4.6,
    numReviews: 88,
  },
  {
    name: 'Non-Stick Cookware Set (10 Piece)',
    description:
      'Complete kitchen cookware set with pots, pans, and lids. PFOA-free non-stick coating, dishwasher safe, and oven safe up to 450°F.',
    price: 129.99,
    category: 'Home & Kitchen',
    brand: 'ChefPro',
    stock: 40,
    images: [
      { url: './images/products/cookware.jpg', alt: 'Cookware Set' },
    ],
    ratings: 4.3,
    numReviews: 56,
  },
  {
    name: 'The Art of Clean Code',
    description:
      'A practical guide to writing maintainable, readable, and efficient code. Covers design patterns, refactoring techniques, and best practices for modern developers.',
    price: 29.99,
    category: 'Books',
    brand: 'TechPress',
    stock: 300,
    images: [
      { url: './images/products/clean-code.jpg', alt: 'Clean Code Book' },
    ],
    ratings: 4.8,
    numReviews: 134,
  },
  {
    name: 'Organic Face Moisturizer',
    description:
      'Lightweight daily moisturizer with hyaluronic acid and vitamin E. Suitable for all skin types, cruelty-free and paraben-free.',
    price: 18.99,
    category: 'Beauty',
    brand: 'PureGlow',
    stock: 150,
    images: [
      { url: './images/products/moisturizer.jpg', alt: 'Face Moisturizer' },
    ],
    ratings: 4.4,
    numReviews: 67,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description:
      'Compact waterproof speaker with 360° sound and 12-hour battery life. Perfect for outdoor adventures and poolside parties.',
    price: 49.99,
    category: 'Electronics',
    brand: 'SoundMax',
    stock: 85,
    images: [
      { url: './images/products/speaker.jpg', alt: 'Bluetooth Speaker' },
    ],
    ratings: 4.1,
    numReviews: 33,
  },
  {
    name: 'Yoga Mat with Carrying Strap',
    description:
      'Extra thick 6mm non-slip yoga mat with alignment lines. Eco-friendly TPE material, includes carrying strap. Great for yoga, pilates, and stretching.',
    price: 32.99,
    category: 'Sports',
    brand: 'FlexZone',
    stock: 90,
    images: [
      { url: './images/products/yoga-mat.jpg', alt: 'Yoga Mat' },
    ],
    ratings: 4.5,
    numReviews: 71,
  },
  {
    name: 'Kids Building Blocks Set (500 pcs)',
    description:
      'Creative building blocks set with 500 pieces in multiple colors and shapes. Compatible with major brands. Develops creativity and motor skills for ages 4+.',
    price: 39.99,
    category: 'Toys',
    brand: 'BrickWorld',
    stock: 60,
    images: [
      { url: './images/products/building-blocks.jpg', alt: 'Building Blocks' },
    ],
    ratings: 4.6,
    numReviews: 48,
  },
  {
    name: 'Ceramic Coffee Mug Set (4 Pack)',
    description:
      'Elegant 12oz ceramic mugs with comfortable handles. Microwave and dishwasher safe. Comes in a set of 4 earth-tone colors.',
    price: 22.99,
    category: 'Home & Kitchen',
    brand: 'CozyHome',
    stock: 110,
    images: [
      { url: './images/products/mug-set.jpg', alt: 'Coffee Mug Set' },
    ],
    ratings: 4.3,
    numReviews: 29,
  },
];

module.exports = products;
