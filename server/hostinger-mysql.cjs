/**
 * Hostinger Free MySQL Database Migration & Helper Utility
 * Run this script to export local data and initialize Hostinger MySQL Database.
 * Usage: node server/hostinger-mysql.cjs
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const sqliteDb = require('./db.cjs');

async function setupHostingerMySQL() {
  console.log('=== STARTING HOSTINGER FREE MYSQL DATABASE MIGRATION ===\n');

  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306
  };

  if (!config.user || !config.password || !config.database) {
    console.error('❌ Error: Missing Hostinger MySQL credentials in .env file!');
    console.log('Please copy .env.example to .env and fill in MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.\n');
    process.exit(1);
  }

  try {
    console.log(`Connecting to Hostinger MySQL Database "${config.database}" at ${config.host}:${config.port}...`);
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully to Hostinger MySQL!');

    console.log('Creating database tables in Hostinger MySQL...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id INT PRIMARY KEY DEFAULT 1,
        announcement_text TEXT,
        announcement_code VARCHAR(255) DEFAULT 'VALUELIFE15',
        contact_phone VARCHAR(255) DEFAULT '+91 98765 43210',
        contact_email VARCHAR(255) DEFAULT 'support@valuelifeessentials.com',
        partial_deposit_percent INT DEFAULT 20,
        enable_multi_currency INT DEFAULT 1,
        enable_cod INT DEFAULT 1,
        enable_partial_payment INT DEFAULT 1,
        partial_payment_heading VARCHAR(255) DEFAULT 'Pay 20% Online Deposit, Rest Cash on Delivery!',
        partial_payment_subtext TEXT,
        prepaid_discount_percent INT DEFAULT 5,
        enable_gst INT DEFAULT 1,
        gstin_number VARCHAR(255) DEFAULT '27AAAAA0000A1Z5',
        store_state VARCHAR(255) DEFAULT 'Maharashtra',
        default_gst_percent DECIMAL(5,2) DEFAULT 5.00,
        gst_type VARCHAR(50) DEFAULT 'INCLUSIVE',
        legal_business_name VARCHAR(255) DEFAULT 'ValueLife Essentials Private Limited',
        all_prices_include_tax INT DEFAULT 1,
        federal_tax_rate DECIMAL(5,2) DEFAULT 0.00
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(255),
        password VARCHAR(255),
        address TEXT,
        role VARCHAR(50) DEFAULT 'CUSTOMER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        icon VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        category_id INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        sku VARCHAR(255) UNIQUE,
        barcode VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        vendor VARCHAR(255) DEFAULT 'OrganicBazar',
        product_type VARCHAR(255) DEFAULT 'Garden Supplies',
        tags TEXT,
        category_id INT,
        subcategory_id INT,
        description TEXT,
        price_inr DECIMAL(10,2) NOT NULL,
        price_usd DECIMAL(10,2) NOT NULL,
        discount_inr DECIMAL(10,2),
        discount_usd DECIMAL(10,2),
        compare_price_inr DECIMAL(10,2),
        compare_price_usd DECIMAL(10,2),
        cost_per_item_inr DECIMAL(10,2),
        cost_per_item_usd DECIMAL(10,2),
        stock INT DEFAULT 100,
        track_inventory INT DEFAULT 1,
        weight DECIMAL(8,2) DEFAULT 0.5,
        hs_code VARCHAR(50) DEFAULT '310100',
        country_of_origin VARCHAR(100) DEFAULT 'India',
        is_best_product INT DEFAULT 0,
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        specs_json TEXT,
        frequently_bought_ids TEXT,
        related_collection_ids TEXT,
        related_mode VARCHAR(50) DEFAULT 'PRODUCTS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(255) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(255) NOT NULL,
        shipping_address TEXT NOT NULL,
        country VARCHAR(100) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) NOT NULL,
        remaining_amount DECIMAL(10,2) NOT NULL,
        payment_mode VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'PARTIAL_PAID',
        order_status VARCHAR(50) DEFAULT 'PROCESSING',
        order_notes TEXT,
        gst_amount DECIMAL(10,2) DEFAULT 0.00,
        cgst_amount DECIMAL(10,2) DEFAULT 0.00,
        sgst_amount DECIMAL(10,2) DEFAULT 0.00,
        igst_amount DECIMAL(10,2) DEFAULT 0.00,
        customer_gstin VARCHAR(50),
        cancellation_reason TEXT,
        cancellation_notes TEXT,
        courier_name VARCHAR(100),
        tracking_number VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ All tables successfully created/verified in Hostinger MySQL!');
    await connection.end();
    console.log('\n=== HOSTINGER MYSQL READY FOR LIVE PRODUCTION USE ===');
  } catch (err) {
    console.error('❌ Hostinger MySQL Setup Error:', err.message);
  }
}

if (require.main === module) {
  setupHostingerMySQL();
}

module.exports = { setupHostingerMySQL };
