require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      announcement_text TEXT DEFAULT 'Get 15% OFF + Free Home Delivery! Use Code: VALUELIFE15',
      announcement_code TEXT DEFAULT 'VALUELIFE15',
      contact_phone TEXT DEFAULT '+91 98765 43210',
      contact_email TEXT DEFAULT 'support@valuelifeessentials.com',
      partial_deposit_percent INTEGER DEFAULT 20,
      enable_multi_currency INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT,
      role TEXT DEFAULT 'CUSTOMER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE,
      barcode TEXT,
      status TEXT DEFAULT 'Active',
      vendor TEXT DEFAULT 'OrganicBazar',
      product_type TEXT DEFAULT 'Garden Supplies',
      tags TEXT DEFAULT 'organic, terrace garden',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
      description TEXT,
      price_inr REAL NOT NULL,
      price_usd REAL NOT NULL,
      discount_inr REAL,
      discount_usd REAL,
      compare_price_inr REAL,
      compare_price_usd REAL,
      cost_per_item_inr REAL,
      cost_per_item_usd REAL,
      stock INTEGER DEFAULT 100,
      track_inventory INTEGER DEFAULT 1,
      weight REAL DEFAULT 0.5,
      hs_code TEXT DEFAULT '310100',
      country_of_origin TEXT DEFAULT 'India',
      is_best_product INTEGER DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT,
      specs_json TEXT,
      frequently_bought_ids TEXT,
      related_collection_ids TEXT,
      related_mode TEXT DEFAULT 'PRODUCTS',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      variant_name TEXT NOT NULL,
      sku TEXT,
      price_inr REAL NOT NULL,
      price_usd REAL NOT NULL,
      discount_inr REAL,
      discount_usd REAL,
      stock INTEGER DEFAULT 50,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_collections (
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, collection_id)
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_email TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT,
      is_verified_buyer INTEGER DEFAULT 1,
      status TEXT DEFAULT 'APPROVED',
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS review_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER REFERENCES product_reviews(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT CHECK (discount_type IN ('PERCENT', 'FLAT')) NOT NULL,
      discount_value REAL NOT NULL,
      min_spend_inr REAL DEFAULT 0,
      min_spend_usd REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      country TEXT NOT NULL,
      currency TEXT NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      remaining_amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      payment_status TEXT DEFAULT 'PARTIAL_PAID',
      order_status TEXT DEFAULT 'PROCESSING',
      order_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS analytics_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      page_url TEXT,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      seo_title TEXT,
      seo_description TEXT,
      status TEXT DEFAULT 'PUBLISHED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-migrate missing columns for users table if needed
  try { db.exec('ALTER TABLE users ADD COLUMN phone TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN address TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN city TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN pincode TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE users ADD COLUMN state TEXT'); } catch(e) {}

  // Seed default CMS pages if empty
  const pageCount = db.prepare('SELECT COUNT(*) as count FROM custom_pages').get().count;
  if (pageCount === 0) {
    db.prepare(`
      INSERT INTO custom_pages (title, slug, content, seo_title, seo_description, status) VALUES
      (
        'About Us',
        'about-us',
        '# Welcome to OrganicBazar\n\nOrganicBazar is India''s premier certified **100% organic grocery and wellness store** committed to pure, chemical-free living.\n\n### Our Mission\nWe partner directly with certified organic farmers across India to deliver farm-fresh superfoods, edible seeds, cold-pressed virgin oils, Lakadong turmeric, and chemical-free skincare straight to your doorstep.\n\n### Why Choose Us?\n- **100% Certified Organic**: Zero pesticides, artificial additives, or preservatives.\n- **Direct Farm Sourcing**: Empowering local organic farmers with fair trade prices.\n- **Quality Tested**: Every batch undergoes strict purity checks in accredited labs.\n- **Sustainable Packaging**: Eco-friendly and recyclable packaging materials.',
        'About OrganicBazar - Certified 100% Organic Store',
        'Learn about OrganicBazar mission to bring certified chemical-free organic groceries and wellness products to Indian homes.',
        'PUBLISHED'
      ),
      (
        'Contact Us',
        'contact-us',
        '# Contact OrganicBazar Customer Support\n\nHave questions about your order or need product guidance? We''re here to help!\n\n### Get in Touch\n- **Email Support**: support@organicbazar.com\n- **Toll-Free Phone**: 1800-123-4567 (Mon-Sat, 9 AM - 7 PM IST)\n- **WhatsApp Assistance**: +91 98123 45678\n- **Head Office**: OrganicBazar Pvt Ltd, Green Tech Park, Sector 62, Noida, Uttar Pradesh 201309\n\nFill out our interactive inquiry form below and our wellness experts will respond within 2 hours.',
        'Contact Us - OrganicBazar Customer Support',
        'Get in touch with OrganicBazar support for order inquiries, product guidance, and customer service.',
        'PUBLISHED'
      ),
      (
        'Shipping & Delivery Policy',
        'shipping-policy',
        '# Shipping & Delivery Policy\n\nWe deliver 100% fresh organic groceries and wellness supplies across all pin codes in India.\n\n### Delivery Timelines\n- **Metro Cities**: 1 to 3 Business Days\n- **Rest of India**: 3 to 5 Business Days\n- **Same Day Dispatch**: Orders placed before 2 PM IST are dispatched on the same day.\n\n### Shipping Charges\n- **Free Shipping** on orders above ₹499.\n- Flat ₹49 shipping fee on orders below ₹499.\n\n### Order Tracking\nOnce your order is shipped, you will receive an SMS and email notification with your AWB tracking link.',
        'Shipping & Delivery Policy - OrganicBazar',
        'Read OrganicBazar fast home delivery timelines, free shipping thresholds, and order tracking policy.',
        'PUBLISHED'
      ),
      (
        'Privacy Policy',
        'privacy-policy',
        '# Privacy Policy\n\nAt OrganicBazar, protecting your personal information and privacy is our top priority.\n\n### Information We Collect\nWe collect basic details such as your name, email, phone number, and delivery address strictly to process your orders and provide customer support.\n\n### Data Security Guarantee\n- We **never sell or share** your personal information with third parties.\n- All payment transactions are encrypted using 256-bit SSL technology.\n- You can request data deletion at any time by contacting support@organicbazar.com.',
        'Privacy Policy - OrganicBazar Data Protection',
        'OrganicBazar strict privacy policy and 256-bit SSL customer data protection guarantee.',
        'PUBLISHED'
      );
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS product_filter_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filter_key TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_filter_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER REFERENCES product_filter_groups(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Seed default Organic Grocery & Wellness filters if empty
  const filterGroupCount = db.prepare('SELECT COUNT(*) as count FROM product_filter_groups').get().count;
  if (filterGroupCount === 0) {
    const insertGrp = db.prepare('INSERT INTO product_filter_groups (name, filter_key, sort_order) VALUES (?, ?, ?)');
    const insertOpt = db.prepare('INSERT INTO product_filter_options (group_id, label, value, sort_order) VALUES (?, ?, ?, ?)');

    const filterSeed = [
      {
        name: 'Form / Type',
        key: 'form',
        options: [
          { label: 'Organic Powders', value: 'powder' },
          { label: 'Raw Seeds', value: 'seeds' },
          { label: 'Whole Spices', value: 'spices' },
          { label: 'Purified Resin', value: 'resin' },
          { label: 'Plant Protein', value: 'protein' },
          { label: 'Natural Clay', value: 'clay' }
        ]
      },
      {
        name: 'Dietary & Certification',
        key: 'dietary',
        options: [
          { label: '100% Certified Organic', value: 'certified_organic' },
          { label: 'Vegan & Plant-Based', value: 'vegan' },
          { label: 'Gluten-Free', value: 'gluten_free' },
          { label: 'Non-GMO', value: 'non_gmo' },
          { label: 'Pesticide Free', value: 'pesticide_free' }
        ]
      },
      {
        name: 'Health Benefit',
        key: 'benefit',
        options: [
          { label: 'Immunity Booster', value: 'immunity' },
          { label: 'Stress & Stamina', value: 'stamina' },
          { label: 'Hair & Skin Care', value: 'hair_skin' },
          { label: 'Digestion & Gut Health', value: 'digestion' },
          { label: 'Weight Management', value: 'weight_management' }
        ]
      },
      {
        name: 'Price Range',
        key: 'price_range',
        options: [
          { label: 'Under ₹200', value: 'under_200' },
          { label: '₹200 - ₹500', value: '200_500' },
          { label: '₹500 - ₹1000', value: '500_1000' },
          { label: 'Above ₹1000', value: 'above_1000' }
        ]
      },
      {
        name: 'Pack Size',
        key: 'pack_size',
        options: [
          { label: '100g Jar', value: '100g' },
          { label: '250g Pack', value: '250g' },
          { label: '500g Jar', value: '500g' },
          { label: '1 Kg Family Pack', value: '1kg' }
        ]
      }
    ];

    filterSeed.forEach((grp, gIdx) => {
      const info = insertGrp.run(grp.name, grp.key, gIdx + 1);
      grp.options.forEach((opt, oIdx) => {
        insertOpt.run(info.lastInsertRowid, opt.label, opt.value, oIdx + 1);
      });
    });
  }

  try { db.exec(`ALTER TABLE coupons ADD COLUMN coupon_category TEXT DEFAULT 'amount_off_order'`); } catch (e) {}
  try { db.exec(`ALTER TABLE coupons ADD COLUMN applies_to_type TEXT DEFAULT 'all'`); } catch (e) {}
  try { db.exec(`ALTER TABLE coupons ADD COLUMN target_ids TEXT DEFAULT '[]'`); } catch (e) {}
  try { db.exec(`ALTER TABLE coupons ADD COLUMN buy_qty INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE coupons ADD COLUMN get_qty INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE coupons ADD COLUMN get_discount_type TEXT DEFAULT 'FREE'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN enable_multi_currency INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN enable_cod INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN enable_partial_payment INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN partial_payment_heading TEXT DEFAULT 'Choose Payment Breakdown Option:'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN partial_payment_subtext TEXT DEFAULT 'Pay rest on Delivery'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN prepaid_discount_percent INTEGER DEFAULT 0`); } catch (e) {}
  
  // GST Tax & Invoice Configuration Migrations
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN enable_gst INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN gstin_number TEXT DEFAULT '27AAAAA0000A1Z5'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN store_state TEXT DEFAULT 'Maharashtra'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN default_gst_percent REAL DEFAULT 5.0`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN gst_type TEXT DEFAULT 'INCLUSIVE'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN legal_business_name TEXT DEFAULT 'OrganicBazar Retail Private Limited'`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN all_prices_include_tax INTEGER DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_settings ADD COLUMN federal_tax_rate REAL DEFAULT 0.0`); } catch (e) {}

  try { db.exec(`ALTER TABLE products ADD COLUMN gst_rate REAL DEFAULT 5.0`); } catch (e) {}

  try { db.exec(`ALTER TABLE orders ADD COLUMN gst_amount REAL DEFAULT 0`); } catch (e) {}
  try { db.exec(`ALTER TABLE orders ADD COLUMN cgst_amount REAL DEFAULT 0`); } catch (e) {}
  try { db.exec(`ALTER TABLE orders ADD COLUMN sgst_amount REAL DEFAULT 0`); } catch (e) {}
  try { db.exec(`ALTER TABLE orders ADD COLUMN igst_amount REAL DEFAULT 0`); } catch (e) {}
  try { db.exec(`ALTER TABLE orders ADD COLUMN customer_gstin TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE orders ADD COLUMN order_notes TEXT`); } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS state_tax_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_name TEXT UNIQUE NOT NULL,
      tax_rate REAL DEFAULT 0.0,
      tax_label TEXT DEFAULT 'IGST',
      tax_rule TEXT DEFAULT 'INSTEAD_OF_FEDERAL',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS collection_tax_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
      tax_rate REAL DEFAULT 5.0,
      state_name TEXT DEFAULT 'ALL',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default 36 Indian states & union territories into state_tax_rates if empty
  const stateCount = db.prepare('SELECT COUNT(*) as count FROM state_tax_rates').get().count;
  if (stateCount === 0) {
    const indianStates = [
      'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
      'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 
      'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 
      'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 
      'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const stmt = db.prepare('INSERT INTO state_tax_rates (state_name, tax_rate, tax_label, tax_rule) VALUES (?, ?, ?, ?)');
    indianStates.forEach(st => {
      const label = st === 'Maharashtra' ? 'SGST' : 'IGST';
      const rule = st === 'Maharashtra' ? 'ADDED_TO_FEDERAL' : 'INSTEAD_OF_FEDERAL';
      stmt.run(st, 0, label, rule);
    });
  }
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_hero_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      hero_enabled INTEGER DEFAULT 1,
      active_style TEXT DEFAULT 'SPLIT',
      badge_text TEXT DEFAULT '100% Certified Organic Superfoods',
      title TEXT DEFAULT 'Pure Farm-Fresh Organic Groceries & Wellness Supplies',
      subtitle TEXT DEFAULT 'Delivering chemical-free superfoods, edible seeds, virgin oils & herbal supplements straight from certified organic farms.',
      primary_btn_text TEXT DEFAULT 'Shop Catalog Now',
      primary_btn_link TEXT DEFAULT '/products',
      secondary_btn_text TEXT DEFAULT 'Explore Organic Offers',
      secondary_btn_link TEXT DEFAULT '/offers',
      image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80',
      bg_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      card_1_title TEXT DEFAULT 'Edible Chia & Flax Seeds',
      card_1_sub TEXT DEFAULT 'Rich in Omega-3 & Fiber',
      card_1_img TEXT DEFAULT 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      card_2_title TEXT DEFAULT 'Pure Ashwagandha Powder',
      card_2_sub TEXT DEFAULT '100% Natural Immunity Booster',
      card_2_img TEXT DEFAULT 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80'
    );
    INSERT OR IGNORE INTO store_hero_config (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS store_theme_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      active_preset TEXT DEFAULT 'EMERALD',
      primary_color TEXT DEFAULT '#3b6e14',
      primary_hover TEXT DEFAULT '#2e5710',
      secondary_color TEXT DEFAULT '#f8f7f2',
      accent_color TEXT DEFAULT '#f59e0b',
      heading_font TEXT DEFAULT 'Outfit',
      body_font TEXT DEFAULT 'Inter',
      border_radius TEXT DEFAULT 'rounded-3xl',
      header_style TEXT DEFAULT 'EMERALD_DARK',
      dark_mode INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO store_theme_config (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS store_sections_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      show_announcement INTEGER DEFAULT 1,
      show_hero INTEGER DEFAULT 1,
      show_trust_badges INTEGER DEFAULT 1,
      show_promo_banners INTEGER DEFAULT 1,
      show_categories_slider INTEGER DEFAULT 1,
      show_bestsellers INTEGER DEFAULT 1,
      show_catalog_grid INTEGER DEFAULT 1,
      show_footer INTEGER DEFAULT 1,
      trust_badge_1_title TEXT DEFAULT '100% Pure Organic',
      trust_badge_1_sub TEXT DEFAULT 'Chemical-free bio products',
      trust_badge_2_title TEXT DEFAULT 'Fast Home Delivery',
      trust_badge_2_sub TEXT DEFAULT 'Safe packaging across India',
      trust_badge_3_title TEXT DEFAULT 'Partial Payment & COD',
      trust_badge_3_sub TEXT DEFAULT 'Pay 20% deposit online',
      trust_badge_4_title TEXT DEFAULT 'Top Rated Service',
      trust_badge_4_sub TEXT DEFAULT '4.9 ★ Average Reviews',
      category_slider_title TEXT DEFAULT 'Shop By Categories',
      bestsellers_title TEXT DEFAULT '🔥 Best Seller Products',
      bestsellers_badge TEXT DEFAULT 'HIGH DEMAND ITEMS',
      bestsellers_count INTEGER DEFAULT 8
    );
    INSERT OR IGNORE INTO store_sections_config (id) VALUES (1);
  `);

  try { db.exec('ALTER TABLE store_sections_config ADD COLUMN show_sales_ticker INTEGER DEFAULT 1'); } catch(e) {}
  try { db.exec('ALTER TABLE store_sections_config ADD COLUMN sales_ticker_json TEXT'); } catch(e) {}

  const heroCount = db.prepare('SELECT COUNT(*) as count FROM store_hero_config').get().count;
  if (heroCount === 0) {
    db.prepare(`
      INSERT INTO store_hero_config (id, hero_enabled, active_style) VALUES (1, 1, 'SPLIT')
    `).run();
  }
  try { db.exec(`ALTER TABLE order_items ADD COLUMN variant_name TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE store_theme_config ADD COLUMN card_style TEXT DEFAULT 'ORGANIC_BAZAR'`); } catch (e) {}
  try { db.exec(`ALTER TABLE order_items ADD COLUMN variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL`); } catch (e) {}
  try { db.exec(`ALTER TABLE collections ADD COLUMN image_url TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE collections ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'Active'`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN vendor TEXT DEFAULT 'OrganicBazar'`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'Garden Supplies'`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN tags TEXT DEFAULT 'organic, terrace garden'`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN barcode TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN compare_price_inr REAL`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN compare_price_usd REAL`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN cost_per_item_inr REAL`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN cost_per_item_usd REAL`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN weight REAL DEFAULT 0.5`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN hs_code TEXT DEFAULT '310100'`); } catch (e) {}
  try { db.exec(`ALTER TABLE products ADD COLUMN country_of_origin TEXT DEFAULT 'India'`); } catch (e) {}

  db.exec(`INSERT OR IGNORE INTO store_settings (id) VALUES (1)`);

  seedInitialData();
}

function seedInitialData() {
  const catCount = db.prepare('SELECT count(*) as cnt FROM categories').get().cnt;
  if (catCount === 0) {
    db.exec(`
      INSERT INTO users (name, email, phone, role) VALUES 
      ('Rajesh Gupta', 'rajesh@gmail.com', '+91 98123 45678', 'CUSTOMER'),
      ('Priya Sharma', 'priya@gmail.com', '+91 98765 12345', 'CUSTOMER'),
      ('Anil Kumar', 'anil@gmail.com', '+91 97111 22334', 'CUSTOMER');

      INSERT INTO categories (name, slug, description, image_url, icon) VALUES 
      ('Organic Fertilizers', 'organic-fertilizers', 'Bio-fertilizers, vermicompost & organic soil boosters', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', '🌿'),
      ('Seeds & Gardening', 'seeds-and-gardening', 'Hybrid vegetable, flower & herb seeds', 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80', '🌱'),
      ('Pots & Grow Bags', 'pots-and-grow-bags', 'Heavy duty HDPE grow bags & plastic pots', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80', '🪴'),
      ('Garden Tools', 'garden-tools', 'Pruning shears, sprayer pumps & watering cans', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=600&q=80', '🛠️'),
      ('Pest Control & Care', 'pest-control', 'Neem oil spray, bio insecticides & plant protection', 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80', '🐛');

      INSERT INTO subcategories (category_id, name, slug) VALUES
      (1, 'Vermicompost', 'vermicompost'),
      (1, 'Neem Cake Powder', 'neem-cake'),
      (1, 'Seaweed Liquid Booster', 'seaweed-booster'),
      (1, 'Bone Meal Powder', 'bone-meal'),
      (2, 'Vegetable Seeds', 'vegetable-seeds'),
      (2, 'Flower Seeds', 'flower-seeds'),
      (2, 'Herb Seeds', 'herb-seeds'),
      (3, 'HDPE Grow Bags 12x12', 'hdpe-grow-bags'),
      (3, 'Fabric Grow Bags', 'fabric-grow-bags'),
      (4, 'Sprayer Pumps', 'sprayer-pumps'),
      (4, 'Pruning Shears', 'pruning-shears'),
      (5, 'Neem Oil Spray', 'neem-oil');

      INSERT INTO collections (name, slug, description, image_url, category_id) VALUES
      ('Best Selling Fertilizers', 'best-selling-fertilizers', 'Top rated customer favorites for home gardens', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', 1),
      ('Monsoon Gardening Sale', 'monsoon-sale', 'Special discounts on bio fertilizers and seeds', 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=800&q=80', 2);

      INSERT INTO banners (title, subtitle, image_url, link_url, sort_order) VALUES 
      ('100% Organic Garden Supplies', 'Boost your terrace garden yield naturally with premium Bio-Fertilizers & HDPE Grow Bags.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80', '/products', 1);

      INSERT INTO coupons (code, discount_type, discount_value, min_spend_inr, min_spend_usd) VALUES
      ('ORGANIC15', 'PERCENT', 15, 300, 10),
      ('FLAT100', 'FLAT', 100, 500, 15);

      INSERT INTO products (title, slug, sku, category_id, subcategory_id, description, price_inr, price_usd, discount_inr, discount_usd, stock, is_best_product, seo_title, seo_description, seo_keywords, specs_json, frequently_bought_ids) VALUES
      ('Organic Vermicompost Fertilizer 5Kg', 'organic-vermicompost-fertilizer-5kg', 'OB-VERM-5', 1, 1, 'Premium grade 100% pure vermicompost enriched with essential nitrogen, phosphorus, and potassium. Increases crop yield and terrace garden soil health.', 499, 12, 349, 9, 150, 1, 'Buy Organic Vermicompost 5Kg Online India', '100% pure organic vermicompost fertilizer for terrace garden plants.', 'vermicompost, organic fertilizer, bio compost', '{"material":"100% Pure Bio Compost","ideal_for":"Terrace Garden, Kitchen Garden","durability":"2 Years Shelf Life","drainage":"Improves Aeration"}', '[2, 3]'),
      ('Seaweed Liquid Concentrate Booster 500ml', 'seaweed-liquid-concentrate-booster-500ml', 'OB-SEA-500', 1, 3, 'Cold-extracted seaweed liquid extract packed with trace minerals, micro-nutrients, and plant growth hormones. Stimulates root growth and vibrant flowering.', 399, 10, 299, 7, 200, 1, 'Organic Seaweed Extract Liquid Fertilizer', 'Natural seaweed plant booster for flowers and vegetables.', 'seaweed liquid, plant booster, bio fertilizer', '{"material":"Cold Extracted Kelp","ideal_for":"Foliar Spray & Soil Drench","durability":"3 Years"}', '[1, 5]'),
      ('Terrace Garden Hybrid Vegetable Seeds Pack (15 Varieties)', 'terrace-garden-hybrid-vegetable-seeds-pack', 'OB-SEED-15', 2, 5, 'Comprehensive seed collection including Tomato, Chilli, Brinjal, Spinach, Coriander, Cucumber, Lady Finger, and Radish. High germination rate guaranteed.', 299, 8, 199, 5, 300, 1, 'Hybrid Vegetable Seeds Pack for Terrace Gardening', 'Buy 15 varieties of high germination vegetable seeds online.', 'vegetable seeds, hybrid seeds, terrace garden seeds', '{"germination_rate":"90%+","ideal_for":"Terrace Garden","plant_types":"Tomato, Chilli, Brinjal, Spinach, Cucumber"}', '[1, 4]'),
      ('HDPE Heavy Duty Grow Bags 12x12 Inch', 'hdpe-heavy-duty-grow-bags-12x12', 'OB-GB-1212', 3, 8, 'UV stabilized 240 GSM heavy duty HDPE grow bags designed to last 5+ years in harsh sun. Drainage holes included for healthy plant roots.', 599, 15, 449, 11, 100, 1, 'HDPE Grow Bags 12x12 Inch Online', 'Durable UV stabilized green HDPE grow bags for terrace garden plants.', 'hdpe grow bags, grow bags 12x12, terrace garden pots', '{"material":"Premium HDPE","gsm":"260 GSM","durability":"5 to 7 Years","capacity":"43.44 L","drainage":"Drainage Holes","shape":"Round","color":"Green","ideal_for":"Terrace Garden, Balcony Garden","suitable_plants":"Vegetables: Capsicum, Brinjal, Tomato, Chilli"}', '[1, 3, 5]'),
      ('Cold Pressed Neem Oil Spray 250ml', 'cold-pressed-neem-oil-spray-250ml', 'OB-NEEM-250', 5, 12, '100% natural organic neem oil water-soluble emulsion. Protects plants against aphids, mealybugs, whiteflies, and fungal leaf spot.', 249, 6, 179, 4, 180, 0, 'Buy Organic Neem Oil Spray for Plants', 'Pure cold pressed neem oil plant protection spray.', 'neem oil, organic pest control, plant fungicide', '{"material":"Pure Neem Seed Oil","ideal_for":"Organic Pest Control"}', '[1, 2]'),
      ('High Pressure Garden Water Sprayer Pump 2 Litre', 'high-pressure-water-sprayer-pump-2L', 'OB-SPRAY-2L', 4, 10, 'Heavy-duty brass nozzle compression sprayer pump with locking trigger for easy foliar feeding and pest control spraying.', 349, 9, 249, 6, 90, 0, '2L Garden Sprayer Pump Brass Nozzle', 'High pressure compression water sprayer pump for plants.', 'sprayer pump, garden water sprayer, foliage sprayer', '{"material":"Heavy Duty Plastic & Brass","capacity":"2 Litres"}', '[5]');

      INSERT INTO product_variants (product_id, variant_name, sku, price_inr, price_usd, discount_inr, discount_usd, stock) VALUES
      (1, '1 Kg Bag', 'OB-VERM-1K', 149, 4, 99, 3, 200),
      (1, '5 Kg Bag', 'OB-VERM-5K', 499, 12, 349, 9, 150),
      (1, '10 Kg Bag', 'OB-VERM-10K', 899, 22, 649, 16, 80),
      (2, '250 ml Bottle', 'OB-SEA-250', 249, 6, 179, 4, 120),
      (2, '500 ml Bottle', 'OB-SEA-500', 399, 10, 299, 7, 200),
      (2, '1 Litre Bottle', 'OB-SEA-1L', 699, 18, 549, 14, 90),
      (3, 'Pack of 5 Varieties', 'OB-SEED-5V', 149, 4, 99, 3, 150),
      (3, 'Pack of 15 Varieties', 'OB-SEED-15V', 299, 8, 199, 5, 300),
      (3, 'Pack of 30 Varieties', 'OB-SEED-30V', 549, 14, 399, 10, 100),
      (4, 'Pack of 1 Bag', 'OB-GB-1P', 149, 4, 119, 3, 250),
      (4, 'Pack of 5 Bags', 'OB-GB-5P', 599, 15, 449, 11, 100),
      (4, 'Pack of 10 Bags', 'OB-GB-10P', 1099, 28, 799, 20, 60),
      (5, '100 ml Spray', 'OB-NEEM-100', 149, 4, 119, 3, 100),
      (5, '250 ml Spray', 'OB-NEEM-250', 249, 6, 179, 4, 180),
      (5, '500 ml Spray', 'OB-NEEM-500', 449, 11, 329, 8, 90);

      INSERT INTO product_images (product_id, image_url, is_primary) VALUES
      (1, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', 1),
      (2, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80', 1),
      (3, 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=800&q=80', 1),
      (4, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80', 1),
      (5, 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', 1),
      (6, 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80', 1);

      INSERT INTO product_collections (product_id, collection_id) VALUES
      (1, 1), (2, 1), (3, 1), (4, 1), (1, 2), (3, 2);

      INSERT INTO product_reviews (product_id, user_name, user_email, rating, title, comment, is_verified_buyer, status) VALUES
      (1, 'Vikram Sharma', 'vikram@gmail.com', 5, 'Exceptional Quality Vermicompost!', 'My tomato plants doubled in size within 2 weeks of adding this vermicompost. 100% recommended!', 1, 'APPROVED'),
      (1, 'Priya Patel', 'priya@gmail.com', 5, 'Truly Organic & Odorless', 'Fast home delivery and excellent moisture retention. My flowering plants look vibrant.', 1, 'APPROVED'),
      (3, 'Anil Kumar', 'anil@gmail.com', 4, 'High Seed Germination Rate', 'Sowed spinach and chilli seeds. 90%+ seeds sprouted within 5 days.', 1, 'APPROVED');

      INSERT INTO review_images (review_id, image_url) VALUES
      (1, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80');

      INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, country, currency, total_amount, paid_amount, remaining_amount, payment_mode, payment_status, order_notes) VALUES
      ('OB-2026-1001', 'Rajesh Gupta', 'rajesh@gmail.com', '+91 98123 45678', 'Flat 402, Green Valley Apartments, Mumbai', 'India', 'INR', 798, 160, 638, 'PARTIAL_COD', 'PARTIAL_PAID', 'Please deliver between 10 AM to 2 PM. Call before delivery.');

      INSERT INTO order_items (order_id, product_id, variant_id, variant_name, quantity, price) VALUES
      (1, 1, 1, '5 kg Bag', 1, 349),
      (1, 4, 2, 'Pack of 5 Bags', 1, 449);
    `);
  }

  try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN password TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN address TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN city TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN state TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN pincode TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN gstin_number TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE users ADD COLUMN business_name TEXT"); } catch (err) {}

  try { db.exec("ALTER TABLE products ADD COLUMN gst_percent REAL"); } catch (err) {}

  try { db.exec("ALTER TABLE orders ADD COLUMN cancellation_reason TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN cancellation_notes TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN courier_name TEXT"); } catch (err) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN tracking_number TEXT"); } catch (err) {}
}

initDb();

module.exports = db;
