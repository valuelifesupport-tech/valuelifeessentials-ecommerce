/**
 * Dynamic SEO & Structured Data Manager for ValueLife Essentials
 * Automatically updates document head, OpenGraph tags, canonical links,
 * and Google Rich Snippets (Schema.org/Product JSON-LD).
 */

const DEFAULT_TITLE = 'ValueLife Essentials | Pure Organic & Wellness Products';
const DEFAULT_DESCRIPTION = 'Shop certified 100% pure organic groceries, herbal supplements, edible cold-pressed oils, and natural ayurvedic wellness products at ValueLife Essentials.';
const SITE_URL = 'https://valuelifeessentials.com';

/**
 * Strips HTML tags and normalizes whitespace for clean meta descriptions.
 */
export function cleanText(html, maxLength = 160) {
  if (!html || typeof html !== 'string') return '';
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).trim() + '...';
}

/**
 * Sets or updates a <meta> tag in <head>.
 */
export function setMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined') return;
  if (!content) return;

  const selector = `meta[${attributeName}="${attributeValue}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or updates the canonical <link rel="canonical"> tag.
 */
export function setCanonicalUrl(url) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

/**
 * Injects or updates a JSON-LD structured data script for Google Rich Snippets.
 */
export function setStructuredData(id, schemaObj) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaObj, null, 2);
}

/**
 * Removes structured data script by id.
 */
export function removeStructuredData(id) {
  if (typeof document === 'undefined') return;
  const script = document.getElementById(id);
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

/**
 * Applies full SEO optimization for a single Product Page.
 */
export function applyProductSEO(product, currency = 'INR', currencySymbol = '₹') {
  if (!product || typeof document === 'undefined') return () => {};

  const productUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const price = product.price_inr || product.price || 0;
  const comparePrice = product.compare_price_inr || product.compare_price || 0;

  // 1. Dynamic Title
  const title = product.seo_title || `${product.title} - Buy Online at Best Price | ValueLife Essentials`;
  document.title = title;

  // 2. Dynamic Description & Keywords
  const description = product.seo_description || cleanText(product.description, 160) || DEFAULT_DESCRIPTION;
  const keywords = product.seo_keywords || `${product.title}, buy ${product.title} online, organic ${product.product_type || 'wellness'}, pure organic, ValueLife Essentials`;

  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);

  // 3. Canonical URL
  setCanonicalUrl(productUrl);

  // 4. OpenGraph (Facebook, WhatsApp, LinkedIn)
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', productUrl);
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:site_name', 'ValueLife Essentials');

  const mainImage = product.image_url || product.thumbnail || `${SITE_URL}/logo.png`;
  setMetaTag('property', 'og:image', mainImage);
  setMetaTag('property', 'og:price:amount', String(price));
  setMetaTag('property', 'og:price:currency', currency === 'INR' ? 'INR' : currency);

  // 5. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', mainImage);

  // 6. Google Rich Snippet (Schema.org/Product JSON-LD)
  const schemaImages = [];
  if (mainImage) schemaImages.push(mainImage);
  if (Array.isArray(product.images)) {
    product.images.forEach(img => {
      const u = typeof img === 'string' ? img : img?.image_url;
      if (u && !schemaImages.includes(u)) schemaImages.push(u);
    });
  }

  const inStock = (product.stock === undefined || product.stock === null || product.stock > 0);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": schemaImages.length > 0 ? schemaImages : [mainImage],
    "description": description,
    "sku": product.sku || `VL-${product.id}`,
    "mpn": String(product.id),
    "brand": {
      "@type": "Brand",
      "name": product.vendor || "ValueLife Essentials"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": String(price),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "ValueLife Essentials"
      }
    }
  };

  // Add AggregateRating if reviews exist
  const reviewCount = Number(product.reviews_count || product.review_count || (Array.isArray(product.reviews) ? product.reviews.length : 0));
  const avgRating = Number(product.avg_rating || product.rating || 5);
  if (reviewCount > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Math.min(5, Math.max(1, avgRating)).toFixed(1),
      "reviewCount": String(reviewCount)
    };
  }

  setStructuredData('product-schema-jsonld', productSchema);

  // Return cleanup function to reset head when user navigates away
  return () => {
    document.title = DEFAULT_TITLE;
    setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
    removeStructuredData('product-schema-jsonld');
  };
}
