const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

const STOREFRONT_URL = 'https://valuelifeessentials.com';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateVal) {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
  });

  const [products] = await conn.query("SELECT id, title, slug, created_at FROM products WHERE status = 'Active' OR status IS NULL ORDER BY id DESC");
  const [categories] = await conn.query('SELECT id, name, slug FROM categories ORDER BY id ASC');
  const [blogs] = await conn.query('SELECT id, title, slug, created_at FROM blog_posts WHERE is_published = 1 ORDER BY id DESC');
  const [pages] = await conn.query("SELECT id, title, slug, created_at FROM custom_pages WHERE is_published = 1 OR is_published IS NULL ORDER BY id ASC");

  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticPages = [
    { loc: `${STOREFRONT_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${STOREFRONT_URL}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${STOREFRONT_URL}/pages/about-us`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${STOREFRONT_URL}/pages/contact-us`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${STOREFRONT_URL}/pages/shipping-policy`, priority: '0.5', changefreq: 'monthly' }
  ];

  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  }

  for (const cat of categories) {
    if (!cat.slug) continue;
    xml += `  <url>\n    <loc>${STOREFRONT_URL}/category/${escapeXml(cat.slug)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const prod of products) {
    if (!prod.slug && !prod.id) continue;
    const slug = prod.slug || String(prod.id);
    const mod = formatDate(prod.created_at);
    xml += `  <url>\n    <loc>${STOREFRONT_URL}/products/${escapeXml(slug)}</loc>\n    <lastmod>${mod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  }

  for (const blog of blogs) {
    if (!blog.slug) continue;
    const mod = formatDate(blog.created_at);
    xml += `  <url>\n    <loc>${STOREFRONT_URL}/blog/${escapeXml(blog.slug)}</loc>\n    <lastmod>${mod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  for (const pg of pages) {
    if (!pg.slug) continue;
    xml += `  <url>\n    <loc>${STOREFRONT_URL}/pages/${escapeXml(pg.slug)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  if (!fs.existsSync('public')) fs.mkdirSync('public');
  fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
  console.log('Successfully generated public/sitemap.xml! Total products included:', products.length);
  await conn.end();
})();
