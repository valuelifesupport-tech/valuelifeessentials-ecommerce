const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Enable Foreign Keys & Write-Ahead Logging for speed
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'CUSTOMER', -- 'ADMIN' or 'CUSTOMER'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      banner_url TEXT,
      is_featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      subcategory_id INTEGER,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, -- SEO Keyword link
      seo_keywords TEXT,
      seo_title TEXT,
      seo_description TEXT,
      sku TEXT UNIQUE,
      description TEXT,
      price_inr REAL NOT NULL DEFAULT 0,
      price_usd REAL NOT NULL DEFAULT 0,
      discount_inr REAL DEFAULT 0,
      discount_usd REAL DEFAULT 0,
      stock INTEGER DEFAULT 50,
      is_best_product INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_collections (
      product_id INTEGER NOT NULL,
      collection_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, collection_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_thumbnail INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS related_products (
      product_id INTEGER NOT NULL,
      related_id INTEGER NOT NULL,
      PRIMARY KEY (product_id, related_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (related_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT,
      is_verified_buyer INTEGER DEFAULT 1,
      status TEXT DEFAULT 'APPROVED', -- 'PENDING', 'APPROVED', 'REJECTED'
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS review_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'PERCENTAGE' or 'FIXED'
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      enable_partial_payment INTEGER DEFAULT 1,
      partial_payment_percentage REAL DEFAULT 20, -- Default 20% deposit
      enable_cod INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      image_url TEXT NOT NULL,
      mobile_image_url TEXT,
      target_link TEXT,
      position TEXT DEFAULT 'HOME_HERO', -- 'HOME_HERO', 'PROMO_STRIP', 'COLLECTION_BANNER'
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT,
      meta_keywords TEXT,
      author TEXT DEFAULT 'Organic Bazar Team',
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      country TEXT DEFAULT 'India',
      currency TEXT DEFAULT 'INR',
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      remaining_amount REAL DEFAULT 0,
      payment_mode TEXT DEFAULT 'FULL', -- 'FULL', 'PARTIAL', 'COD'
      payment_status TEXT DEFAULT 'PENDING',
      order_status TEXT DEFAULT 'PROCESSING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      ip_address TEXT,
      country TEXT DEFAULT 'India',
      page_url TEXT,
      product_id INTEGER,
      action TEXT NOT NULL, -- 'VIEW', 'ADD_TO_CART', 'WISHLIST', 'PURCHASE'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const catCount = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (catCount === 0) {
    console.log('Seeding initial database content inspired by OrganicBazar.net...');

    // 1. Categories
    const insertCat = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
    const catFertilizer = insertCat.run('Organic Fertilizers', 'organic-fertilizers', '100% Pure & Natural soil nutrients for home gardening', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80').lastInsertRowid;
    const catSeeds = insertCat.run('Seeds & Gardening', 'seeds-and-gardening', 'High germinating vegetable, flower, and herb seeds', 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=600&q=80').lastInsertRowid;
    const catPots = insertCat.run('Pots & Grow Bags', 'pots-and-grow-bags', 'HDPE grow bags, ceramic pots, and planter containers', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80').lastInsertRowid;

    // 2. Subcategories
    const insertSubcat = db.prepare('INSERT INTO subcategories (category_id, name, slug, description) VALUES (?, ?, ?, ?)');
    const subLiquid = insertSubcat.run(catFertilizer, 'Liquid Fertilizers', 'liquid-fertilizers', 'Seaweed extract and bio-pesticides').lastInsertRowid;
    const subVermicompost = insertSubcat.run(catFertilizer, 'Vermicompost', 'vermicompost-fertilizer', 'Premium earthworm compost').lastInsertRowid;
    insertSubcat.run(catSeeds, 'Vegetable Seeds', 'vegetable-seeds', 'Organic hybrid seeds for terrace gardens');

    // 3. Collections
    const insertColl = db.prepare('INSERT INTO collections (name, slug, description, banner_url, is_featured) VALUES (?, ?, ?, ?, ?)');
    const collBestSellers = insertColl.run('Best Selling Fertilizers', 'best-selling-fertilizers', 'Top rated plant boosters trusted by terrace gardeners', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', 1).lastInsertRowid;
    const collMonsoon = insertColl.run('Monsoon Gardening Sale', 'monsoon-gardening-sale', 'Special offer on plant growth boosters', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80', 1).lastInsertRowid;

    // 4. Banners
    const insertBanner = db.prepare('INSERT INTO banners (title, subtitle, image_url, target_link, position, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertBanner.run('100% Organic Garden Supplies', 'Boost your terrace garden yield naturally with premium Bio-Fertilizers', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1400&q=80', '/collection/best-selling-fertilizers', 'HOME_HERO', 1);
    insertBanner.run('Special Monsoon Sale - Up to 40% OFF', 'Get HDPE Grow Bags & Hybrid Vegetable Seeds at discount prices', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80', '/collection/monsoon-gardening-sale', 'HOME_HERO', 2);

    // 5. Products (Fixed INR & USD pricing + SEO Keywords)
    const insertProd = db.prepare(`
      INSERT INTO products (category_id, subcategory_id, title, slug, seo_keywords, seo_title, seo_description, sku, description, price_inr, price_usd, discount_inr, discount_usd, stock, is_best_product, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const p1 = insertProd.run(
      catFertilizer, subVermicompost,
      'Organic Vermicompost Fertilizer 5Kg', 'organic-vermicompost-fertilizer-5kg',
      'vermicompost, organic fertilizer for home garden, potting soil nutrient',
      'Buy Premium Organic Vermicompost Fertilizer 5kg Online',
      '100% Pure Earthworm Compost enriched with essential micro-nutrients for potted plants and home gardens.',
      'ORG-VERM-5K',
      'Organic Vermicompost is a 100% pure earthworm compost rich in nitrogen, phosphorus, potassium, and micronutrients. Improves soil texture, aeration, and root growth for home plants.',
      499, 12, 349, 9, 100, 1, 1
    ).lastInsertRowid;

    const p2 = insertProd.run(
      catFertilizer, subLiquid,
      'Seaweed Liquid Concentrate Booster 500ml', 'seaweed-liquid-fertilizer-booster',
      'seaweed extract liquid fertilizer, plant growth booster, organic spray',
      'Seaweed Liquid Fertilizer Spray 500ml - Organic Plant Booster',
      'Natural cold-water seaweed extract. Accelerates flowering, fruiting, and immunity against pests.',
      'ORG-SEA-500',
      'Seaweed Extract Liquid Fertilizer is packed with over 60 natural minerals, vitamins, and amino acids. Enhances chlorophyll synthesis and accelerates flowering and fruiting in all plants.',
      599, 15, 420, 10, 80, 1, 1
    ).lastInsertRowid;

    const p3 = insertProd.run(
      catSeeds, null,
      'Terrace Garden Hybrid Vegetable Seeds Pack (15 Varieties)', 'hybrid-vegetables-seeds-pack',
      'organic vegetable seeds, terrace garden seeds pack, kitchen garden seeds',
      'Buy 15 Hybrid Vegetable Seeds Pack for Terrace Gardening',
      'Includes Tomato, Chilli, Brinjal, Spinach, Coriander, Cucumber, Radish, and 8 more easy-to-grow seeds.',
      'ORG-SEED-15P',
      'High germination rate (>85%) untreated non-GMO hybrid seeds specifically curated for home gardening, balconies, and terrace gardens.',
      399, 10, 249, 6, 150, 1, 1
    ).lastInsertRowid;

    const p4 = insertProd.run(
      catPots, null,
      'HDPE Heavy Duty Grow Bags 12x12 Inch (Pack of 5)', 'hdpe-grow-bags-12x12-pack-5',
      'hdpe grow bags 12x12, terrace garden grow bags, plant containers',
      'HDPE Grow Bags 12x12 Inch Pack of 5 for Vegetables & Plants',
      '240 GSM UV stabilized heavy duty green grow bags built for 5+ years outdoor life.',
      'ORG-GB-1212-5P',
      'UV Stabilized 240 GSM Green HDPE Grow Bags designed with drainage holes for proper root aeration and healthy vegetable farming.',
      650, 18, 480, 12, 60, 0, 1
    ).lastInsertRowid;

    // Attach product collections
    const insertProdColl = db.prepare('INSERT INTO product_collections (product_id, collection_id) VALUES (?, ?)');
    insertProdColl.run(p1, collBestSellers);
    insertProdColl.run(p2, collBestSellers);
    insertProdColl.run(p3, collMonsoon);
    insertProdColl.run(p4, collMonsoon);

    // Related Products
    const insertRel = db.prepare('INSERT INTO related_products (product_id, related_id) VALUES (?, ?)');
    insertRel.run(p1, p2);
    insertRel.run(p1, p3);
    insertRel.run(p2, p1);

    // Product Images
    const insertImg = db.prepare('INSERT INTO product_images (product_id, image_url, is_thumbnail, sort_order) VALUES (?, ?, ?, ?)');
    insertImg.run(p1, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertImg.run(p1, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', 0, 2);
    insertImg.run(p2, 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertImg.run(p3, 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80', 1, 1);
    insertImg.run(p4, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', 1, 1);

    // 6. Product Reviews (Ratings + Verified Badges)
    const insertRev = db.prepare(`
      INSERT INTO product_reviews (product_id, user_name, user_email, rating, title, comment, is_verified_buyer, status, admin_reply)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const r1 = insertRev.run(p1, 'Ramesh Kumar', 'ramesh@gmail.com', 5, 'Amazing Soil Nutrient!', 'My tomato plants started flowering heavily within 10 days of applying this vermicompost. Very clean and odor-free.', 1, 'APPROVED', 'Thank you Ramesh! Happy terrace gardening!').lastInsertRowid;
    insertRev.run(p1, 'Priya Sharma', 'priya@yahoo.com', 5, 'Best quality earthworm compost', 'Good packaging and fast delivery. Highly recommended for potting soil mix.', 1, 'APPROVED', null);
    insertRev.run(p2, 'Vikram Singh', 'vikram@gmail.com', 4, 'Very effective liquid booster', 'Visible growth boost in indoor money plants and roses. Will order again.', 1, 'APPROVED', null);

    const insertRevImg = db.prepare('INSERT INTO review_images (review_id, image_url) VALUES (?, ?)');
    insertRevImg.run(r1, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80');

    // 7. Coupons (Partial Payment + COD toggles)
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_value, enable_partial_payment, partial_payment_percentage, enable_cod)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertCoupon.run('ORGANIC15', 'PERCENTAGE', 15, 500, 1, 20, 1);
    insertCoupon.run('WELCOME100', 'FIXED', 100, 799, 1, 25, 1);

    // 8. Blogs
    const insertBlog = db.prepare('INSERT INTO blogs (title, slug, content, cover_image, meta_keywords) VALUES (?, ?, ?, ?, ?)');
    insertBlog.run(
      'Top 7 Tips for Growing Organic Tomatoes in Terrace Grow Bags',
      'growing-organic-tomatoes-terrace-grow-bags',
      'Growing tomatoes at home is easy with the right soil blend! Mix 40% Vermicompost with 40% Cocopeat and 20% garden soil. Spray Seaweed liquid booster bi-weekly to prevent blossom end rot and maximize fruit size.',
      'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=1000&q=80',
      'organic tomatoes, terrace garden tips, vermicompost guide'
    );

    // 9. Initial Analytics Logs & Sample Orders
    const insertAnalytics = db.prepare('INSERT INTO analytics_logs (session_id, ip_address, country, page_url, product_id, action) VALUES (?, ?, ?, ?, ?, ?)');
    for (let i = 0; i < 45; i++) {
      insertAnalytics.run(`sess_${Math.random().toString(36).substr(2, 9)}`, '103.21.124.5', i % 5 === 0 ? 'United States' : 'India', '/product/organic-vermicompost-fertilizer-5kg', p1, i % 3 === 0 ? 'PURCHASE' : i % 2 === 0 ? 'ADD_TO_CART' : 'VIEW');
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, country, currency, total_amount, paid_amount, remaining_amount, payment_mode, payment_status, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const o1 = insertOrder.run('ORD-2026-8812', 'Anil Mehta', 'anil@gmail.com', '+91 9876543210', 'Flat 402, Green Acres, Mumbai', 'India', 'INR', 769, 154, 615, 'PARTIAL', 'PARTIAL_PAID', 'PROCESSING').lastInsertRowid;
    
    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    insertOrderItem.run(o1, p1, 1, 349);
    insertOrderItem.run(o1, p2, 1, 420);
  }
}

initDb();

module.exports = db;
