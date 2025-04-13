"use strict";

const axios = require("axios");
const {
  BaseService
} = require("medusa-interfaces");
class StrapiContentService extends BaseService {
  constructor({
    productService,
    regionService
  }, options) {
    super();
    this.productService_ = productService;
    this.regionService_ = regionService;
    this.strapiUrl_ = process.env.STRAPI_URL || "http://localhost:1337";
    this.strapiToken_ = process.env.STRAPI_API_TOKEN;
    this.cacheManager_ = new Map();
    this.cacheTTL_ = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get Strapi content for a product by its Medusa ID
   * @param {string} productId - The Medusa product ID
   * @param {string} locale - The locale to fetch content for (e.g., 'nl', 'de')
   * @returns {Promise<Object>} The extended content from Strapi
   */
  async getProductContent(productId, locale = "nl") {
    try {
      const cacheKey = `product_${productId}_${locale}`;

      // Check cache first
      if (this.cacheManager_.has(cacheKey)) {
        const {
          data,
          timestamp
        } = this.cacheManager_.get(cacheKey);
        if (Date.now() - timestamp < this.cacheTTL_) {
          return data;
        }
      }

      // Fetch from Strapi
      const response = await axios.get(`${this.strapiUrl_}/api/products`, {
        params: {
          "filters[medusaId][$eq]": productId,
          "locale": locale,
          "populate": "deep"
        },
        headers: this.strapiToken_ ? {
          Authorization: `Bearer ${this.strapiToken_}`
        } : {}
      });
      if (response.data && response.data.data && response.data.data.length > 0) {
        const content = response.data.data[0].attributes;

        // Cache the result
        this.cacheManager_.set(cacheKey, {
          data: content,
          timestamp: Date.now()
        });
        return content;
      }
      return null;
    } catch (error) {
      console.error("Error fetching product content from Strapi:", error.message);
      return null;
    }
  }

  /**
   * Enrich a Medusa product with Strapi content
   * @param {Object} product - The Medusa product
   * @param {string} regionCode - The region code (e.g., 'nl', 'be', 'de')
   * @returns {Promise<Object>} The product enriched with Strapi content
   */
  async enrichProductWithContent(product, regionCode = "nl") {
    if (!product) return product;
    try {
      // Map region codes to locales
      const localeMap = {
        nl: "nl",
        be: "nl",
        // Belgium also uses Dutch
        de: "de"
      };
      const locale = localeMap[regionCode] || "nl";
      const content = await this.getProductContent(product.id, locale);
      if (!content) return product;

      // Enrich the product with Strapi content
      return {
        ...product,
        strapi_content: {
          extended_description: content.extendedDescription,
          seo: {
            title: content.seoTitle,
            description: content.seoDescription,
            keywords: content.seoKeywords
          },
          features: content.features || [],
          specifications: content.specifications || [],
          faq: content.faq || [],
          region_specific_info: (content.regionSpecificInfo || []).filter(info => info.regionCode === regionCode)
        }
      };
    } catch (error) {
      console.error("Error enriching product with Strapi content:", error.message);
      return product;
    }
  }

  /**
   * Enrich multiple Medusa products with Strapi content
   * @param {Array<Object>} products - Array of Medusa products
   * @param {string} regionCode - The region code (e.g., 'nl', 'be', 'de')
   * @returns {Promise<Array<Object>>} Array of products enriched with Strapi content
   */
  async enrichProductsWithContent(products, regionCode = "nl") {
    if (!products || !products.length) return products;
    try {
      const enrichedProducts = await Promise.all(products.map(product => this.enrichProductWithContent(product, regionCode)));
      return enrichedProducts;
    } catch (error) {
      console.error("Error enriching products with Strapi content:", error.message);
      return products;
    }
  }

  /**
   * Clear the content cache for a product
   * @param {string} productId - The Medusa product ID
   */
  clearProductCache(productId) {
    if (!productId) return;

    // Clear cache for all locales
    ["nl", "de"].forEach(locale => {
      const cacheKey = `product_${productId}_${locale}`;
      this.cacheManager_.delete(cacheKey);
    });
  }

  /**
   * Clear the entire content cache
   */
  clearCache() {
    this.cacheManager_.clear();
  }
}
module.exports = StrapiContentService;