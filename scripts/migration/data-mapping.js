/**
 * Data Mapping Configuration for Statamic to Medusa.js/Strapi Migration
 * 
 * This file defines how data from the Statamic CMS and Simple Commerce
 * should be mapped to Medusa.js and Strapi CMS during migration.
 */

const REGION_DOMAINS = {
  nl: {
    domain: 'example.nl',
    name: 'Netherlands',
    currency: 'EUR',
    defaultLanguage: 'nl'
  },
  be: {
    domain: 'example.be',
    name: 'Belgium',
    currency: 'EUR',
    defaultLanguage: 'nl'
  },
  de: {
    domain: 'example.de',
    name: 'Germany',
    currency: 'EUR',
    defaultLanguage: 'de'
  }
};

const SUPPORTED_LANGUAGES = ['nl', 'de'];

/**
 * Mappings for Simple Commerce Products to Medusa.js Products
 */
const productMapping = {
  // Source fields from Statamic/Simple Commerce
  source: {
    collection: 'products', // Statamic collection name
    titleField: 'title',
    slugField: 'slug',
    descriptionField: 'description',
    statusField: 'status',
    priceField: 'price',
    imagesField: 'images',
    variantsField: 'variants',
    categoryField: 'product_categories'
  },
  // Target fields in Medusa.js
  target: {
    // Core product fields
    title: 'title',
    handle: 'handle', // Will be derived from slug
    description: 'description',
    status: source => source.status === 'published' ? 'published' : 'draft',
    // Custom fields setup
    metadata: source => ({
      statamic_id: source.id,
      original_slug: source.slug,
      statamic_updated_at: source.updated_at,
      locale: source.locale || 'nl'
    }),
    // Variants transformation
    variants: source => source.variants.map(variant => ({
      title: variant.name || 'Default Variant',
      sku: variant.sku,
      prices: [
        {
          currency_code: 'eur',
          amount: parseInt((parseFloat(variant.price) * 100).toFixed(0))
        }
      ],
      inventory_quantity: variant.stock || 0,
      manage_inventory: true,
      options: [
        {
          value: variant.name || 'Default'
        }
      ],
      metadata: {
        statamic_variant_id: variant.id
      }
    })),
    // Region-specific adaptations
    salesChannels: source => {
      // Map to sales channels based on availability or locale
      const channels = [];
      
      if (source.region_availability) {
        // If product has explicit region availability
        if (source.region_availability.includes('nl')) channels.push('nl-store');
        if (source.region_availability.includes('be')) channels.push('be-store');
        if (source.region_availability.includes('de')) channels.push('de-store');
      } else if (source.locale) {
        // Based on locale
        if (source.locale === 'nl') {
          channels.push('nl-store', 'be-store'); // Dutch content available in NL and BE
        } else if (source.locale === 'de') {
          channels.push('de-store');
        }
      } else {
        // Default to all channels if no specific info
        channels.push('nl-store', 'be-store', 'de-store');
      }
      
      return channels;
    }
  }
};

/**
 * Mappings for content pages and other collections to Strapi
 */
const contentMapping = {
  // Collection mappings
  collections: {
    // Pages collection mapping
    pages: {
      source: {
        collection: 'pages',
        titleField: 'title',
        slugField: 'slug',
        contentField: 'content'
      },
      target: {
        contentType: 'page',
        fields: {
          title: 'title',
          slug: 'slug',
          content: source => source._content || source.content,
          locale: source => source._locale || 'nl',
          publishedAt: source => source.status === 'published' ? new Date() : null,
          metadata: source => ({
            statamic_id: source.id,
            statamic_path: source._path
          })
        }
      }
    },
    // Blog posts collection mapping
    blog: {
      source: {
        collection: 'blog',
        titleField: 'title',
        slugField: 'slug',
        contentField: 'content',
        dateField: 'date',
        authorField: 'author',
        featuredImageField: 'featured_image'
      },
      target: {
        contentType: 'blog-post',
        fields: {
          title: 'title',
          slug: 'slug',
          content: source => source._content || source.content,
          publishDate: 'date',
          locale: source => source._locale || 'nl',
          publishedAt: source => source.status === 'published' ? new Date() : null,
          featuredImage: source => source.featured_image,
          author: source => {
            return { connect: [{ id: `{{authors.${source.author}}}` }] };
          },
          metadata: source => ({
            statamic_id: source.id
          })
        }
      }
    }
  },
  
  // Global content mappings
  globals: {
    // Site settings
    site_settings: {
      source: 'site_settings',
      target: {
        contentType: 'site-settings',
        fields: {
          siteName: 'site_name',
          companyInfo: 'company_info',
          contactEmail: 'contact_email',
          socialLinks: 'social_links',
          locale: source => source._key || 'nl'
        }
      }
    },
    // Header navigation
    header: {
      source: 'header',
      target: {
        contentType: 'header',
        fields: {
          logo: 'logo',
          mainMenu: 'main_menu',
          locale: source => source._key || 'nl'
        }
      }
    },
    // Footer content
    footer: {
      source: 'footer',
      target: {
        contentType: 'footer',
        fields: {
          copyright: 'copyright',
          footerColumns: 'footer_columns',
          locale: source => source._key || 'nl'
        }
      }
    }
  },
  
  // Navigation mappings
  navigation: {
    main: {
      source: 'main',
      target: {
        contentType: 'navigation',
        fields: {
          name: () => 'Main Navigation',
          items: 'tree',
          locale: source => source._key || 'nl'
        }
      }
    },
    footer: {
      source: 'footer',
      target: {
        contentType: 'navigation',
        fields: {
          name: () => 'Footer Navigation',
          items: 'tree',
          locale: source => source._key || 'nl'
        }
      }
    }
  }
};

/**
 * Region settings mapping (currencies, countries, taxes)
 */
const regionMapping = {
  source: 'region-settings',
  target: {
    // Medusa.js regions configuration
    regions: [
      {
        // Netherlands region
        name: 'Netherlands',
        currency_code: 'eur',
        countries: ['nl'],
        tax_rate: source => {
          // Find the NL tax rate from source data
          const nlTax = Object.values(source.taxes).find(tax => 
            tax.country === 'nl' || tax.name.toLowerCase().includes('netherlands')
          );
          return nlTax ? parseFloat(nlTax.rate) : 21;
        },
        metadata: {
          domain: REGION_DOMAINS.nl.domain,
          default_language: 'nl'
        }
      },
      {
        // Belgium region
        name: 'Belgium',
        currency_code: 'eur',
        countries: ['be'],
        tax_rate: source => {
          // Find the BE tax rate from source data
          const beTax = Object.values(source.taxes).find(tax => 
            tax.country === 'be' || tax.name.toLowerCase().includes('belgium')
          );
          return beTax ? parseFloat(beTax.rate) : 21;
        },
        metadata: {
          domain: REGION_DOMAINS.be.domain,
          default_language: 'nl'
        }
      },
      {
        // Germany region
        name: 'Germany',
        currency_code: 'eur',
        countries: ['de'],
        tax_rate: source => {
          // Find the DE tax rate from source data
          const deTax = Object.values(source.taxes).find(tax => 
            tax.country === 'de' || tax.name.toLowerCase().includes('germany')
          );
          return deTax ? parseFloat(deTax.rate) : 19;
        },
        metadata: {
          domain: REGION_DOMAINS.de.domain,
          default_language: 'de'
        }
      }
    ],
    // Medusa.js sales channels configuration
    salesChannels: [
      {
        name: 'Netherlands Store',
        description: 'Sales channel for Dutch customers',
        is_disabled: false,
        metadata: {
          domain: REGION_DOMAINS.nl.domain,
          region_key: 'nl',
          default_language: 'nl'
        }
      },
      {
        name: 'Belgium Store',
        description: 'Sales channel for Belgian customers',
        is_disabled: false,
        metadata: {
          domain: REGION_DOMAINS.be.domain,
          region_key: 'be',
          default_language: 'nl'
        }
      },
      {
        name: 'Germany Store',
        description: 'Sales channel for German customers',
        is_disabled: false,
        metadata: {
          domain: REGION_DOMAINS.de.domain,
          region_key: 'de',
          default_language: 'de'
        }
      }
    ],
    // Currencies configuration
    currencies: source => Object.keys(source.currencies).map(code => ({
      code: code.toLowerCase(),
      symbol: source.currencies[code].symbol,
      name: source.currencies[code].name
    }))
  }
};

/**
 * Customer mapping
 */
const customerMapping = {
  source: {
    collection: 'customers',
    emailField: 'email',
    nameField: 'name',
    passwordField: 'password'
  },
  target: {
    email: 'email',
    first_name: source => {
      if (source.name) {
        const nameParts = source.name.split(' ');
        return nameParts[0];
      }
      return '';
    },
    last_name: source => {
      if (source.name) {
        const nameParts = source.name.split(' ');
        return nameParts.slice(1).join(' ');
      }
      return '';
    },
    password: source => source.password ? source.password : null,
    metadata: source => ({
      statamic_id: source._id,
      original_locale: source.locale || 'nl'
    })
  }
};

/**
 * Order mapping
 */
const orderMapping = {
  source: {
    collection: 'orders',
    statusField: 'status',
    customerField: 'customer',
    itemsField: 'items',
    paymentField: 'gateway_data',
    billingField: 'billing_address',
    shippingField: 'shipping_address'
  },
  target: {
    email: source => source.email,
    status: source => {
      // Map Simple Commerce status to Medusa status
      const statusMap = {
        created: 'pending',
        paid: 'completed',
        unpaid: 'requires_action',
        canceled: 'canceled',
        shipped: 'shipped'
      };
      return statusMap[source.status] || 'pending';
    },
    customer_id: source => `{{customers.${source.customer}}}`,
    shipping_address: source => source.shipping_address ? {
      first_name: source.shipping_address.name?.split(' ')[0] || '',
      last_name: source.shipping_address.name?.split(' ').slice(1).join(' ') || '',
      address_1: source.shipping_address.address1 || '',
      address_2: source.shipping_address.address2 || '',
      city: source.shipping_address.city || '',
      postal_code: source.shipping_address.zip || '',
      country_code: source.shipping_address.country || 'nl'
    } : null,
    billing_address: source => source.billing_address ? {
      first_name: source.billing_address.name?.split(' ')[0] || '',
      last_name: source.billing_address.name?.split(' ').slice(1).join(' ') || '',
      address_1: source.billing_address.address1 || '',
      address_2: source.billing_address.address2 || '',
      city: source.billing_address.city || '',
      postal_code: source.billing_address.zip || '',
      country_code: source.billing_address.country || 'nl'
    } : null,
    currency_code: source => source.currency?.toLowerCase() || 'eur',
    region_id: source => {
      // Determine region based on shipping or customer data
      const country = source.shipping_address?.country || 
                     source.billing_address?.country || 
                     source.customer_country || 
                     'nl';
      
      // Map country to region
      if (country === 'nl') return '{{regions.Netherlands}}';
      if (country === 'be') return '{{regions.Belgium}}';
      if (country === 'de') return '{{regions.Germany}}';
      return '{{regions.Netherlands}}'; // Default
    },
    items: source => source.items ? source.items.map(item => ({
      title: item.name || 'Product',
      quantity: parseInt(item.quantity) || 1,
      variant_id: `{{variants.${item.id}}}`,
      unit_price: parseInt((parseFloat(item.price) * 100).toFixed(0))
    })) : [],
    metadata: source => ({
      statamic_id: source._id,
      original_order_number: source.order_number
    })
  }
};

module.exports = {
  REGION_DOMAINS,
  SUPPORTED_LANGUAGES,
  productMapping,
  contentMapping,
  regionMapping,
  customerMapping,
  orderMapping
}; 