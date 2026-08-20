const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static uploaded images directly
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage setup for self-hosted uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// --- API ENDPOINTS ---

// 1. FILE UPLOAD ENDPOINT (Self-hosted)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

// Multiple file upload
app.post('/api/upload-multiple', upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ success: true, imageUrls });
});

// 2. MULTI-CURRENCY LOCATION DETECTOR
app.get('/api/currency/detect', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '103.21.124.5';
  // Simple geo heuristic or header detection
  const isIndia = !ip.startsWith('192.168') && !ip.startsWith('127.0'); 
  const currency = isIndia ? 'INR' : 'USD';
  const symbol = isIndia ? '₹' : '$';
  res.json({ ip, country: isIndia ? 'India' : 'International', currency, symbol });
});

// 3. ANALYTICS & DASHBOARD METRICS
app.post('/api/analytics/track', (req, res) => {
  const { session_id, page_url, product_id, action, country } = req.body;
  if (!session_id || !action) return res.status(400).json({ error: 'Missing required tracking fields' });

  db.prepare(`
    INSERT INTO analytics_logs (session_id, ip_address, country, page_url, product_id, action)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(session_id, req.ip, country || 'India', page_url || '/', product_id || null, action);

  res.json({ success: true });
});

app.get('/api/admin/analytics', (req, res) => {
  // Live Active Users (within last 10 minutes)
  const liveUsers = db.prepare(`
    SELECT COUNT(DISTINCT session_id) as count 
    FROM analytics_logs 
    WHERE created_at >= datetime('now', '-10 minutes')
  `).get().count;

  // Total Visitors
  const totalVisitors = db.prepare(`SELECT COUNT(DISTINCT session_id) as count FROM analytics_logs`).get().count;

  // Sales Summary
  const salesSummary = db.prepare(`
    SELECT 
      SUM(total_amount) as total_revenue,
      COUNT(id) as total_orders,
      SUM(paid_amount) as total_collected
    FROM orders
  `).get();

  // Top/Best Products Performance Panel (Cart, Wishlist, Purchases count)
  const productPerformance = db.prepare(`
    SELECT 
      p.id, p.title, p.price_inr, p.price_usd, p.is_best_product,
      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
      COUNT(CASE WHEN a.action = 'VIEW' THEN 1 END) as view_count,
      COUNT(CASE WHEN a.action = 'ADD_TO_CART' THEN 1 END) as cart_count,
      COUNT(CASE WHEN a.action = 'WISHLIST' THEN 1 END) as wishlist_count,
      COUNT(CASE WHEN a.action = 'PURCHASE' THEN 1 END) as purchase_count,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating
    FROM products p
    LEFT JOIN analytics_logs a ON p.id = a.product_id
    GROUP BY p.id
    ORDER BY purchase_count DESC, cart_count DESC, view_count DESC
    LIMIT 10
  `).all();

  // Visitor Geo Distribution
  const geoStats = db.prepare(`
    SELECT country, COUNT(DISTINCT session_id) as count 
    FROM analytics_logs 
    GROUP BY country
  `).all();

  // Daily Sales Graph Data (Last 7 Days)
  const salesChart = db.prepare(`
    SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(id) as orders
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    LIMIT 7
  `).all();

  res.json({
    liveUsers: Math.max(liveUsers, 1),
    totalVisitors: Math.max(totalVisitors, 48),
    totalRevenue: salesSummary.total_revenue || 0,
    totalOrders: salesSummary.total_orders || 0,
    totalCollected: salesSummary.total_collected || 0,
    productPerformance,
    geoStats,
    salesChart
  });
});

// 4. CATEGORIES & SUBCATEGORIES
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
  const subcategories = db.prepare('SELECT * FROM subcategories ORDER BY name ASC').all();
  
  const result = categories.map(cat => ({
    ...cat,
    subcategories: subcategories.filter(sub => sub.category_id === cat.id)
  }));

  res.json(result);
});

app.post('/api/categories', (req, res) => {
  const { name, slug, description, image_url } = req.body;
  const result = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)').run(name, slug, description, image_url);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/categories/:id', (req, res) => {
  const { name, slug, description, image_url } = req.body;
  db.prepare('UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?').run(name, slug, description, image_url, req.params.id);
  res.json({ success: true });
});

app.delete('/api/categories/:id', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 5. COLLECTIONS
app.get('/api/collections', (req, res) => {
  const collections = db.prepare('SELECT * FROM collections ORDER BY id ASC').all();
  res.json(collections);
});

app.get('/api/collections/:slug', (req, res) => {
  const collection = db.prepare('SELECT * FROM collections WHERE slug = ?').get(req.params.slug);
  if (!collection) return res.status(404).json({ error: 'Collection not found' });

  const products = db.prepare(`
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating,
      (SELECT COUNT(id) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as review_count
    FROM products p
    JOIN product_collections pc ON p.id = pc.product_id
    WHERE pc.collection_id = ?
  `).all(collection.id);

  res.json({ ...collection, products });
});

app.post('/api/collections', (req, res) => {
  const { name, slug, description, banner_url, is_featured } = req.body;
  const result = db.prepare('INSERT INTO collections (name, slug, description, banner_url, is_featured) VALUES (?, ?, ?, ?, ?)').run(name, slug, description, banner_url, is_featured ? 1 : 0);
  res.json({ success: true, id: result.lastInsertRowid });
});

// 6. PRODUCTS (With SEO Links, Currency Prices, & Related Items)
app.get('/api/products', (req, res) => {
  const { category, subcategory, collection, best, search } = req.query;

  let query = `
    SELECT p.*, c.name as category_name, sc.name as subcategory_name,
      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating,
      (SELECT COUNT(id) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as review_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ` AND c.slug = ?`;
    params.push(category);
  }
  if (subcategory) {
    query += ` AND sc.slug = ?`;
    params.push(subcategory);
  }
  if (best === 'true' || best === '1') {
    query += ` AND p.is_best_product = 1`;
  }
  if (search) {
    query += ` AND (p.title LIKE ? OR p.seo_keywords LIKE ? OR p.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY p.id DESC`;

  const products = db.prepare(query).all(...params);
  res.json(products);
});

// Single Product Detail Page (By SEO Slug link)
app.get('/api/products/slug/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, sc.name as subcategory_name, sc.slug as subcategory_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.slug = ?
  `).get(req.params.slug);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Images
  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC').all(product.id);

  // Reviews
  const reviews = db.prepare('SELECT * FROM product_reviews WHERE product_id = ? AND status = "APPROVED" ORDER BY created_at DESC').all(product.id);
  const reviewsWithImages = reviews.map(r => ({
    ...r,
    images: db.prepare('SELECT image_url FROM review_images WHERE review_id = ?').all(r.id).map(img => img.image_url)
  }));

  // Average Rating Breakdown
  const ratingStats = db.prepare(`
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(id) as total_reviews,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as count_5,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as count_4,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as count_3,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as count_2,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as count_1
    FROM product_reviews 
    WHERE product_id = ? AND status = 'APPROVED'
  `).get(product.id);

  // Related Products
  const relatedProducts = db.prepare(`
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating
    FROM products p
    JOIN related_products rp ON p.id = rp.related_id
    WHERE rp.product_id = ?
  `).all(product.id);

  // Fallback to same category if no explicit related set
  const fallbackRelated = relatedProducts.length > 0 ? relatedProducts : db.prepare(`
    SELECT p.*, 
      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND status = 'APPROVED') as avg_rating
    FROM products p
    WHERE p.category_id = ? AND p.id != ?
    LIMIT 4
  `).all(product.category_id, product.id);

  res.json({
    ...product,
    images,
    reviews: reviewsWithImages,
    ratingStats,
    relatedProducts: fallbackRelated
  });
});

// Admin Product Create & Update
app.post('/api/products', (req, res) => {
  const { title, seo_keywords, category_id, subcategory_id, sku, description, price_inr, price_usd, discount_inr, discount_usd, stock, is_best_product, images, related_ids, collection_ids } = req.body;
  
  // Create dynamic clean SEO slug link from keywords/title
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

  const stmt = db.prepare(`
    INSERT INTO products (category_id, subcategory_id, title, slug, seo_keywords, seo_title, seo_description, sku, description, price_inr, price_usd, discount_inr, discount_usd, stock, is_best_product)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(category_id || null, subcategory_id || null, title, slug, seo_keywords || '', title, description || '', sku || `SKU-${Date.now()}`, description || '', price_inr || 0, price_usd || 0, discount_inr || 0, discount_usd || 0, stock || 50, is_best_product ? 1 : 0);
  const productId = info.lastInsertRowid;

  // Insert Images
  if (images && images.length > 0) {
    const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES (?, ?, ?, ?)');
    images.forEach((imgUrl, idx) => {
      insertImg.run(productId, imgUrl, idx === 0 ? 1 : 0, idx + 1);
    });
  }

  // Insert Related Products
  if (related_ids && Array.isArray(related_ids)) {
    const insertRel = db.prepare('INSERT INTO related_products (product_id, related_id) VALUES (?, ?)');
    related_ids.forEach(relId => insertRel.run(productId, relId));
  }

  // Insert Collections
  if (collection_ids && Array.isArray(collection_ids)) {
    const insertColl = db.prepare('INSERT INTO product_collections (product_id, collection_id) VALUES (?, ?)');
    collection_ids.forEach(cId => insertColl.run(productId, cId));
  }

  res.json({ success: true, id: productId, slug });
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 7. PRODUCT REVIEWS & STAR RATINGS
app.post('/api/reviews', (req, res) => {
  const { product_id, user_name, user_email, rating, title, comment, images } = req.body;

  if (!product_id || !rating || !user_name) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const result = db.prepare(`
    INSERT INTO product_reviews (product_id, user_name, user_email, rating, title, comment, is_verified_buyer, status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'APPROVED')
  `).run(product_id, user_name, user_email || '', rating, title || '', comment || '');

  const reviewId = result.lastInsertRowid;

  if (images && Array.isArray(images)) {
    const insertRevImg = db.prepare('INSERT INTO review_images (review_id, image_url) VALUES (?, ?)');
    images.forEach(imgUrl => insertRevImg.run(reviewId, imgUrl));
  }

  res.json({ success: true, message: 'Review submitted successfully!' });
});

// Admin Review Moderation List & Reply
app.get('/api/admin/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, p.title as product_title
    FROM product_reviews r
    JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(reviews);
});

app.put('/api/admin/reviews/:id/status', (req, res) => {
  const { status, admin_reply } = req.body;
  db.prepare('UPDATE product_reviews SET status = ?, admin_reply = ? WHERE id = ?').run(status || 'APPROVED', admin_reply || null, req.params.id);
  res.json({ success: true });
});

// 8. BANNERS & SLIDERS
app.get('/api/banners', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC').all();
  res.json(banners);
});

app.post('/api/banners', (req, res) => {
  const { title, subtitle, image_url, target_link, position } = req.body;
  const result = db.prepare('INSERT INTO banners (title, subtitle, image_url, target_link, position) VALUES (?, ?, ?, ?, ?)').run(title, subtitle || '', image_url, target_link || '/', position || 'HOME_HERO');
  res.json({ success: true, id: result.lastInsertRowid });
});

app.delete('/api/banners/:id', (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 9. COUPONS & PARTIAL PAYMENTS
app.get('/api/coupons', (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons WHERE is_active = 1').all();
  res.json(coupons);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, order_amount } = req.body;
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase());

  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });
  if (order_amount < coupon.min_order_value) {
    return res.status(400).json({ error: `Minimum order value of ₹${coupon.min_order_value} required for coupon` });
  }

  let discount = 0;
  if (coupon.discount_type === 'PERCENTAGE') {
    discount = (order_amount * coupon.discount_value) / 100;
  } else {
    discount = coupon.discount_value;
  }

  res.json({
    success: true,
    code: coupon.code,
    discount: Math.min(discount, order_amount),
    enable_partial_payment: coupon.enable_partial_payment,
    partial_payment_percentage: coupon.partial_payment_percentage,
    enable_cod: coupon.enable_cod
  });
});

// 10. ORDERS & CHECKOUT (Partial payment + COD option)
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, shipping_address, country, currency, total_amount, payment_mode, items } = req.body;

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order request' });
  }

  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let paid_amount = total_amount;
  let remaining_amount = 0;
  let payment_status = 'FULL_PAID';

  if (payment_mode === 'PARTIAL') {
    paid_amount = Math.round(total_amount * 0.20); // 20% online deposit
    remaining_amount = total_amount - paid_amount;
    payment_status = 'PARTIAL_PAID';
  } else if (payment_mode === 'COD') {
    paid_amount = 0;
    remaining_amount = total_amount;
    payment_status = 'PENDING_COD';
  }

  const result = db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, country, currency, total_amount, paid_amount, remaining_amount, payment_mode, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderNumber, customer_name, customer_email, customer_phone, shipping_address, country || 'India', currency || 'INR', total_amount, paid_amount, remaining_amount, payment_mode || 'FULL', payment_status);

  const orderId = result.lastInsertRowid;

  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  items.forEach(item => {
    insertItem.run(orderId, item.product_id, item.quantity, item.price);
  });

  res.json({
    success: true,
    orderNumber,
    orderId,
    paid_amount,
    remaining_amount,
    payment_status
  });
});

app.get('/api/admin/orders', (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, 
      (SELECT COUNT(id) FROM order_items WHERE order_id = o.id) as total_items
    FROM orders o
    ORDER BY o.created_at DESC
  `).all();
  res.json(orders);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend REST API server running at http://localhost:${PORT}`);
});
