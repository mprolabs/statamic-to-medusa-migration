# Multi-Region Setup Guide

This document provides step-by-step instructions for setting up the multi-region commerce implementation using Medusa.js and Strapi CMS.

## Prerequisites

Before beginning the setup, ensure you have the following prerequisites installed:

- Node.js (v16.x or higher)
- PostgreSQL (v12.x or higher)
- Redis (v6.x or higher)
- Git

## 1. Setting Up Medusa.js with Multi-Region Support

### 1.1 Install Medusa CLI

```bash
npm install -g @medusajs/medusa-cli
```

### 1.2 Create a New Medusa Project

```bash
medusa new medusa-server --seed
cd medusa-server
```

### 1.3 Install Multi-Region Required Packages

```bash
npm install medusa-plugin-multi-regional medusa-plugin-sales-channels
```

### 1.4 Configure Medusa for Multi-Region

Update your `medusa-config.js` file with the following configurations:

```javascript
// medusa-config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  projectConfig: {
    redis_url: process.env.REDIS_URL,
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",
    store_cors: process.env.STORE_CORS,
    admin_cors: process.env.ADMIN_CORS,
    region_strategy: "per_domain",
    default_region_map: {
      "example.nl": process.env.NL_REGION_ID,
      "example.be": process.env.BE_REGION_ID,
      "example.de": process.env.DE_REGION_ID
    },
  },
  plugins: [
    // Multi-region support
    {
      resolve: `medusa-plugin-multi-regional`,
      options: {
        enableAutomaticRegionDetection: true,
        regionDetectionStrategy: "domain",
        domainToRegionMap: {
          "example.nl": process.env.NL_REGION_ID,
          "example.be": process.env.BE_REGION_ID,
          "example.de": process.env.DE_REGION_ID
        }
      }
    },
    // Sales channels plugin
    {
      resolve: `medusa-plugin-sales-channels`,
      options: {}
    },
    // Other plugins...
  ]
};
```

### 1.5 Create a Setup Script for Regions

Create a setup script to initialize the regions, currencies, and sales channels:

```javascript
// scripts/setup-regions.js
const { MedusaContainer } = require('@medusajs/medusa/dist/globals');
const { RegionService, SalesChannelService, StoreService } = require('@medusajs/medusa');

(async () => {
  // Get required services
  const container = MedusaContainer.getContainer();
  const regionService = container.resolve("regionService");
  const salesChannelService = container.resolve("salesChannelService");
  const storeService = container.resolve("storeService");
  
  try {
    console.log("Setting up multi-region configuration...");
    
    // Set up NL region
    const nlRegion = await regionService.create({
      name: "Netherlands",
      currency_code: "eur",
      tax_rate: 21,
      payment_providers: ["stripe", "ideal"],
      fulfillment_providers: ["postnl", "manual"],
      countries: ["nl"],
      metadata: {
        domain: "example.nl",
        locale: "nl_NL"
      }
    });
    console.log(`Created Netherlands region with ID: ${nlRegion.id}`);
    
    // Set up NL sales channel
    const nlChannel = await salesChannelService.create({
      name: "NL Store",
      description: "Dutch storefront",
      metadata: {
        domain: "example.nl",
        region_id: nlRegion.id
      }
    });
    console.log(`Created NL sales channel with ID: ${nlChannel.id}`);
    
    // Set up BE region
    const beRegion = await regionService.create({
      name: "Belgium",
      currency_code: "eur",
      tax_rate: 21,
      payment_providers: ["stripe", "ideal"],
      fulfillment_providers: ["bpost", "manual"],
      countries: ["be"],
      metadata: {
        domain: "example.be",
        locale: "nl_BE"
      }
    });
    console.log(`Created Belgium region with ID: ${beRegion.id}`);
    
    // Set up BE sales channel
    const beChannel = await salesChannelService.create({
      name: "BE Store",
      description: "Belgian storefront",
      metadata: {
        domain: "example.be",
        region_id: beRegion.id
      }
    });
    console.log(`Created BE sales channel with ID: ${beChannel.id}`);
    
    // Set up DE region
    const deRegion = await regionService.create({
      name: "Germany",
      currency_code: "eur",
      tax_rate: 19,
      payment_providers: ["stripe", "giropay"],
      fulfillment_providers: ["dhl", "manual"],
      countries: ["de"],
      metadata: {
        domain: "example.de",
        locale: "de_DE"
      }
    });
    console.log(`Created Germany region with ID: ${deRegion.id}`);
    
    // Set up DE sales channel
    const deChannel = await salesChannelService.create({
      name: "DE Store",
      description: "German storefront",
      metadata: {
        domain: "example.de",
        region_id: deRegion.id
      }
    });
    console.log(`Created DE sales channel with ID: ${deChannel.id}`);
    
    // Update .env file with region IDs
    console.log("\nAdd these values to your .env file:");
    console.log(`NL_REGION_ID=${nlRegion.id}`);
    console.log(`BE_REGION_ID=${beRegion.id}`);
    console.log(`DE_REGION_ID=${deRegion.id}`);
    console.log(`NL_CHANNEL_ID=${nlChannel.id}`);
    console.log(`BE_CHANNEL_ID=${beChannel.id}`);
    console.log(`DE_CHANNEL_ID=${deChannel.id}`);
    
    console.log("\nMulti-region setup completed successfully!");
  } catch (error) {
    console.error("Error setting up regions:", error);
  }
  
  process.exit(0);
})();
```

### 1.6 Run the Setup Script

```bash
node scripts/setup-regions.js
```

Add the output region and channel IDs to your `.env` file.

## 2. Setting Up Strapi CMS with Multi-Language Support

### 2.1 Create a New Strapi Project

```bash
npx create-strapi-app strapi-server --quickstart
cd strapi-server
```

### 2.2 Install Required Plugins

```bash
npm install @strapi/plugin-i18n @strapi/plugin-graphql strapi-plugin-navigation
```

### 2.3 Configure Locales

Start the Strapi server:

```bash
npm run develop
```

In the Strapi admin interface:

1. Navigate to Settings > Internationalization
2. Add the following locales:
   - Dutch (nl) - Set as default
   - German (de)

### 2.4 Create Content Types

Create the following content types in Strapi:

#### Product Content

```json
{
  "kind": "collectionType",
  "collectionName": "product_contents",
  "info": {
    "name": "Product Content",
    "description": "Extended content for Medusa.js products"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "productId": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "extendedDescription": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "specifications": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "additionalImages": {
      "type": "media",
      "multiple": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "regionAvailability": {
      "type": "json",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    }
  }
}
```

#### Pages

```json
{
  "kind": "collectionType",
  "collectionName": "pages",
  "info": {
    "name": "Page",
    "description": "Create static pages for your website"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "featuredImage": {
      "type": "media",
      "multiple": false,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "regionAvailability": {
      "type": "json",
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    }
  }
}
```

#### Regional Content

```json
{
  "kind": "collectionType",
  "collectionName": "regional_contents",
  "info": {
    "name": "Regional Content",
    "description": "Region-specific content blocks"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "identifier": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    },
    "title": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "content": {
      "type": "richtext",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "media": {
      "type": "media",
      "multiple": true,
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "regionId": {
      "type": "string",
      "required": true,
      "pluginOptions": {
        "i18n": {
          "localized": false
        }
      }
    }
  }
}
```

### 2.5 Create the SEO Component

Create a new component for SEO metadata:

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "name": "SEO",
    "icon": "search"
  },
  "options": {},
  "attributes": {
    "metaTitle": {
      "type": "string"
    },
    "metaDescription": {
      "type": "text"
    },
    "metaImage": {
      "type": "media",
      "multiple": false
    },
    "keywords": {
      "type": "text"
    },
    "canonicalURL": {
      "type": "string"
    }
  }
}
```

## 3. Setting Up the Integration Layer

### 3.1 Create Integration Service

Create a new Node.js project for the integration layer:

```bash
mkdir integration-service
cd integration-service
npm init -y
npm install express axios dotenv cors
```

### 3.2 Create Integration Configuration

Create a `.env` file:

```env
# Medusa settings
MEDUSA_URL=http://localhost:9000
MEDUSA_ADMIN_API_KEY=your_medusa_admin_key

# Strapi settings
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token

# Region mappings
NL_REGION_ID=reg_nl_XXX
BE_REGION_ID=reg_be_XXX
DE_REGION_ID=reg_de_XXX

# Channel mappings
NL_CHANNEL_ID=sc_nl_XXX
BE_CHANNEL_ID=sc_be_XXX
DE_CHANNEL_ID=sc_de_XXX
```

### 3.3 Create the Integration Server

Create `server.js`:

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Medusa API client
const medusaClient = axios.create({
  baseURL: process.env.MEDUSA_URL,
  headers: {
    'Authorization': `Bearer ${process.env.MEDUSA_ADMIN_API_KEY}`
  }
});

// Strapi API client
const strapiClient = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: {
    'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
  }
});

// Product synchronization
app.post('/sync/product', async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Get product from Medusa
    const { data: medusaProduct } = await medusaClient.get(`/admin/products/${productId}`);
    
    // Check if product already exists in Strapi
    const strapiProductQuery = await strapiClient.get('/api/product-contents', {
      params: {
        filters: {
          productId: productId
        }
      }
    });
    
    const existingProduct = strapiProductQuery.data.data.length > 0 
      ? strapiProductQuery.data.data[0] 
      : null;
    
    // Prepare product data
    const productData = {
      productId: medusaProduct.id,
      extendedDescription: medusaProduct.description || '',
      // Determine region availability from sales channels
      regionAvailability: determineRegionAvailability(medusaProduct.sales_channels)
    };
    
    // Create or update product in Strapi
    if (existingProduct) {
      await strapiClient.put(`/api/product-contents/${existingProduct.id}`, {
        data: productData
      });
      res.json({ success: true, action: 'updated', productId });
    } else {
      await strapiClient.post('/api/product-contents', {
        data: productData
      });
      res.json({ success: true, action: 'created', productId });
    }
  } catch (error) {
    console.error('Product sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to determine region availability
function determineRegionAvailability(salesChannels) {
  if (!salesChannels) return [];
  
  const regionMap = new Map([
    [process.env.NL_CHANNEL_ID, 'nl'],
    [process.env.BE_CHANNEL_ID, 'be'],
    [process.env.DE_CHANNEL_ID, 'de']
  ]);
  
  return salesChannels
    .map(channel => regionMap.get(channel.id))
    .filter(Boolean);
}

// Listen for Medusa webhook events
app.post('/webhook/medusa', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'product.created' || event === 'product.updated') {
    // Queue product synchronization
    axios.post(`http://localhost:${PORT}/sync/product`, { productId: data.id })
      .catch(error => console.error('Error syncing product from webhook:', error));
  }
  
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Integration service running on port ${PORT}`);
});
```

### 3.4 Configure Medusa Webhooks

Set up a webhook in Medusa to notify the integration service of product changes:

```javascript
// In medusa-config.js
{
  resolve: `medusa-plugin-webhooks`,
  options: {
    webhooks: [
      {
        name: "integration-service",
        url: "http://localhost:3030/webhook/medusa",
        events: [
          "product.created",
          "product.updated",
          "product.deleted"
        ]
      }
    ]
  }
}
```

## 4. Setting Up the Next.js Storefront

### 4.1 Create a Next.js Project

```bash
npx create-next-app@latest storefront
cd storefront
```

### 4.2 Install Required Dependencies

```bash
npm install @medusajs/medusa-js @tanstack/react-query axios js-cookie next-i18next
```

### 4.3 Configure Domain-Based Routing

Create custom server code to handle multiple domains:

```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const DOMAIN_REGION_MAP = {
  'example.nl': {
    regionId: process.env.NL_REGION_ID,
    locale: 'nl'
  },
  'example.be': {
    regionId: process.env.BE_REGION_ID,
    locale: 'nl'
  },
  'example.de': {
    regionId: process.env.DE_REGION_ID,
    locale: 'de'
  }
};

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;
    
    // Extract domain from host header
    const host = req.headers.host || '';
    const domain = host.split(':')[0];
    
    // Add region and locale info to context
    if (DOMAIN_REGION_MAP[domain]) {
      // Inject region and locale into the query params
      query.regionId = DOMAIN_REGION_MAP[domain].regionId;
      query.locale = DOMAIN_REGION_MAP[domain].locale;
    }
    
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
```

### 4.4 Configure Next.js for Multi-Language Support

Create `next-i18next.config.js`:

```javascript
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'nl',
    locales: ['nl', 'de'],
    localeDetection: false
  }
};
```

Update `next.config.js`:

```javascript
// next.config.js
const { i18n } = require('./next-i18next.config.js');

module.exports = {
  i18n,
  images: {
    domains: ['localhost', 'example.nl', 'example.be', 'example.de']
  }
}
```

### 4.5 Create a Region Context Provider

Create a context for managing region state:

```javascript
// context/RegionContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import medusaClient from '../lib/medusa-client';

const RegionContext = createContext(null);

export const RegionProvider = ({ children }) => {
  const router = useRouter();
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get region ID from router query (injected by custom server)
    const regionId = router.query.regionId;
    
    if (regionId) {
      // Fetch region details
      medusaClient.regions.retrieve(regionId)
        .then(({ region }) => {
          setRegion(region);
          // Store in cookie for future reference
          Cookies.set('selectedRegion', regionId);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Attempt to get region from cookie
      const savedRegionId = Cookies.get('selectedRegion');
      if (savedRegionId) {
        medusaClient.regions.retrieve(savedRegionId)
          .then(({ region }) => setRegion(region))
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [router.query.regionId]);
  
  const switchRegion = async (regionId) => {
    try {
      const { region } = await medusaClient.regions.retrieve(regionId);
      setRegion(region);
      
      // Store selection in cookie
      Cookies.set('selectedRegion', regionId);
      
      // Get the domain for this region
      const domain = region.metadata?.domain;
      if (domain) {
        // Redirect to the appropriate domain
        window.location.href = `https://${domain}${router.pathname}`;
      }
    } catch (error) {
      console.error("Error switching region:", error);
    }
  };
  
  return (
    <RegionContext.Provider value={{ region, loading, switchRegion }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
```

### 4.6 Create Medusa Client

```javascript
// lib/medusa-client.js
import Medusa from "@medusajs/medusa-js";

const medusaClient = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000",
  maxRetries: 3
});

export default medusaClient;
```

### 4.7 Create Strapi Client

```javascript
// lib/strapi-client.js
import axios from 'axios';

const strapiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337/api",
});

export const fetchPage = async (slug, locale = 'nl') => {
  try {
    const response = await strapiClient.get('/pages', {
      params: {
        locale,
        filters: {
          slug
        },
        populate: 'deep'
      }
    });
    
    return response.data.data[0];
  } catch (error) {
    console.error("Error fetching page from Strapi:", error);
    return null;
  }
};

export const fetchProductContent = async (productId, locale = 'nl') => {
  try {
    const response = await strapiClient.get('/product-contents', {
      params: {
        locale,
        filters: {
          productId
        },
        populate: 'deep'
      }
    });
    
    return response.data.data[0];
  } catch (error) {
    console.error("Error fetching product content from Strapi:", error);
    return null;
  }
};

export const fetchRegionalContent = async (identifier, regionId, locale = 'nl') => {
  try {
    const response = await strapiClient.get('/regional-contents', {
      params: {
        locale,
        filters: {
          identifier,
          regionId
        },
        populate: 'deep'
      }
    });
    
    return response.data.data[0];
  } catch (error) {
    console.error("Error fetching regional content from Strapi:", error);
    return null;
  }
};

export default strapiClient;
```

## 5. Testing the Multi-Region Setup

### 5.1 Update Host File for Local Testing

To test multiple domains locally, update your `/etc/hosts` file:

```
127.0.0.1   example.nl
127.0.0.1   example.be
127.0.0.1   example.de
```

### 5.2 Run All Services

Run each service in a separate terminal:

```bash
# Medusa
cd medusa-server
npm run start

# Strapi
cd strapi-server
npm run develop

# Integration Service
cd integration-service
node server.js

# Next.js
cd storefront
node server.js
```

### 5.3 Test Region-Specific Functionality

1. Visit each domain in your browser:
   - http://example.nl:3000
   - http://example.be:3000
   - http://example.de:3000

2. Verify that each domain loads the correct region and language.

3. Test product creation and synchronization:
   - Create a product in Medusa admin
   - Assign it to different sales channels
   - Verify that the product appears in Strapi
   - Check that the product is visible on the appropriate storefronts

4. Test content creation:
   - Add region-specific content in Strapi
   - Verify that content appears on the appropriate storefronts
   - Test language switching

## 6. Production Deployment Considerations

For production deployment, consider the following:

1. **Domain Configuration**:
   - Set up separate domains or subdomains for each region
   - Configure DNS records for each domain
   - Set up SSL certificates for each domain

2. **Load Balancing**:
   - Implement a load balancer to route traffic to the appropriate instances
   - Configure health checks for each service

3. **Database Scaling**:
   - Set up read replicas for high-traffic scenarios
   - Consider sharding for very large datasets

4. **Caching**:
   - Implement Redis caching for performance optimization
   - Use CDN for static assets and pages

5. **Monitoring**:
   - Set up monitoring for each service
   - Configure alerts for errors and performance issues

6. **CI/CD**:
   - Implement automated deployment pipelines
   - Set up staging environments for testing

## 7. Troubleshooting

### 7.1 Region Detection Issues

If the region is not being detected correctly:

1. Check the domain mapping in the custom server
2. Verify the region IDs in the `.env` file
3. Ensure cookies are being set correctly

### 7.2 Product Synchronization Issues

If products are not syncing between Medusa and Strapi:

1. Verify webhook configuration in Medusa
2. Check integration service logs for errors
3. Ensure API tokens are correct

### 7.3 Content Display Issues

If content is not displaying correctly:

1. Check locale settings in Strapi
2. Verify that content has the correct region assignment
3. Ensure the Next.js i18n configuration is correct 