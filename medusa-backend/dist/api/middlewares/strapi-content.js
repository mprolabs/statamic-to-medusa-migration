"use strict";

const {
  getConfigFile
} = require("medusa-core-utils");
const {
  resolve
} = require("path");
module.exports = (req, res, next) => {
  const {
    container
  } = req.scope;
  const strapiContentService = container.resolve("strapiContentService");

  // Store the original send method
  const originalSend = res.send;
  res.send = async function (body) {
    // Only intercept JSON responses
    if (typeof body === "string" && body.startsWith("{")) {
      try {
        const data = JSON.parse(body);

        // Determine the region from the request
        const regionCode = req.query.region || "nl";

        // Check if it's a single product response
        if (data.product && data.product.id) {
          const enrichedProduct = await strapiContentService.enrichProductWithContent(data.product, regionCode);
          data.product = enrichedProduct;

          // Call the original send method with the enriched data
          return originalSend.call(this, JSON.stringify(data));
        }

        // Check if it's a products list response
        if (data.products && Array.isArray(data.products)) {
          const enrichedProducts = await strapiContentService.enrichProductsWithContent(data.products, regionCode);
          data.products = enrichedProducts;

          // Call the original send method with the enriched data
          return originalSend.call(this, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error in Strapi content middleware:", error);
      }
    }

    // For all other cases, just call the original send method
    return originalSend.call(this, body);
  };
  next();
};