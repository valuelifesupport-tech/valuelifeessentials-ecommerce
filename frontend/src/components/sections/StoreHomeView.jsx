import React from 'react';
import HeroSection from './HeroSection';
import CategorySlider from './CategorySlider';
import FeaturedProductsSection from './FeaturedProductsSection';
import EditorialPromoBanner from './EditorialPromoBanner';
import WhyChooseUsSection from './WhyChooseUsSection';
import BestSellersSection from './BestSellersSection';
import BrandStorySection from './BrandStorySection';
import TestimonialsSection from './TestimonialsSection';
import InstagramFeedSection from './InstagramFeedSection';
import NewsletterBanner from './NewsletterBanner';

export default function StoreHomeView({
  heroConfig,
  sectionsConfig,
  settings,
  categories = [],
  bestProducts = [],
  wishlist = [],
  currencySymbol = '₹',
  navigateTo,
  handleAddToCart,
  handleToggleWishlist
}) {
  return (
    <div className="space-y-0" data-reticle-target="store-home-view">
      {/* 2. HERO SECTION */}
      <HeroSection 
        heroConfig={heroConfig} 
        navigateTo={navigateTo} 
        sectionsConfig={sectionsConfig} 
      />

      {/* 3. SHOP BY CATEGORY */}
      <CategorySlider 
        categories={categories} 
        navigateTo={navigateTo} 
        sectionsConfig={sectionsConfig} 
      />

      {/* 4. FEATURED PRODUCTS */}
      <FeaturedProductsSection
        products={bestProducts}
        wishlist={wishlist}
        currencySymbol={currencySymbol}
        handleAddToCart={handleAddToCart}
        handleToggleWishlist={handleToggleWishlist}
        navigateTo={navigateTo}
      />

      {/* 5. EDITORIAL PROMO BANNER */}
      <EditorialPromoBanner 
        navigateTo={navigateTo} 
        sectionsConfig={sectionsConfig}
      />

      {/* 6. WHY CHOOSE VALUELIFE? */}
      <WhyChooseUsSection sectionsConfig={sectionsConfig} />

      {/* 7. BEST SELLERS */}
      <BestSellersSection
        products={bestProducts}
        currencySymbol={currencySymbol}
        handleAddToCart={handleAddToCart}
        navigateTo={navigateTo}
        sectionsConfig={sectionsConfig}
      />

      {/* 8. BRAND STORY (OUR STORY) */}
      <BrandStorySection 
        navigateTo={navigateTo} 
        sectionsConfig={sectionsConfig}
      />

      {/* 9. TESTIMONIALS */}
      <TestimonialsSection sectionsConfig={sectionsConfig} />

      {/* 10. INSTAGRAM FEED */}
      <InstagramFeedSection 
        sectionsConfig={sectionsConfig}
        settings={settings}
      />

      {/* 11. NEWSLETTER */}
      <NewsletterBanner sectionsConfig={sectionsConfig} />
    </div>
  );
}
