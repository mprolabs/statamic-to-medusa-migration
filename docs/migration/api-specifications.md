---
title: API Specifications
parent: Migration
nav_order: 1
has_toc: true
permalink: /migration/api-specifications/
---

# API Specifications

This document outlines the API specifications for the Statamic to Saleor migration, detailing endpoints, authentication, and request/response formats to support the multi-region and multi-language requirements.

## GraphQL API Overview

Saleor provides a comprehensive GraphQL API which will be used for all commerce operations. The API supports:

- Multi-region operations through Saleor's Channel system
- Multi-language content through Saleor's translation capabilities
- Complete e-commerce functionality including products, checkout, and orders

### API Endpoint

All API interactions will be made to a single GraphQL endpoint:

```
https://[saleor-instance]/graphql/
```

## Core Entity Endpoints

### Products API

#### Fetching Products with Region and Language Context

```graphql
query GetProducts($channel: String!, $languageCode: LanguageCodeEnum!, $first: Int!) {
  products(
    channel: $channel,
    first: $first
  ) {
    edges {
      node {
        id
        name
        description
        translation(languageCode: $languageCode) {
          name
          description
        }
        slug
        thumbnail {
          url
          alt
        }
        pricing {
          priceRange {
            start {
              gross {
                amount
                currency
              }
            }
          }
        }
        category {
          name
          translation(languageCode: $languageCode) {
            name
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### Product Details

```graphql
query GetProductDetails($slug: String!, $channel: String!, $languageCode: LanguageCodeEnum!) {
  product(slug: $slug, channel: $channel) {
    id
    name
    description
    translation(languageCode: $languageCode) {
      name
      description
    }
    slug
    category {
      id
      name
      translation(languageCode: $languageCode) {
        name
      }
    }
    variants {
      id
      name
      translation(languageCode: $languageCode) {
        name
      }
      pricing {
        price {
          gross {
            amount
            currency
          }
        }
      }
      attributes {
        attribute {
          name
          translation(languageCode: $languageCode) {
            name
          }
        }
        values {
          name
          translation(languageCode: $languageCode) {
            name
          }
        }
      }
    }
    attributes {
      attribute {
        name
        translation(languageCode: $languageCode) {
          name
        }
      }
      values {
        name
        translation(languageCode: $languageCode) {
          name
        }
      }
    }
    media {
      url
      alt
    }
  }
}
```

### Categories API

#### Fetching Categories

```graphql
query GetCategories($channel: String!, $languageCode: LanguageCodeEnum!) {
  categories(first: 100) {
    edges {
      node {
        id
        name
        description
        translation(languageCode: $languageCode) {
          name
          description
        }
        slug
        products(channel: $channel, first: 5) {
          totalCount
          edges {
            node {
              id
              name
              translation(languageCode: $languageCode) {
                name
              }
            }
          }
        }
        children(first: 10) {
          edges {
            node {
              id
              name
              translation(languageCode: $languageCode) {
                name
              }
              slug
            }
          }
        }
      }
    }
  }
}
```

### Orders API

#### Fetching Orders for a Channel

```graphql
query GetOrders($channel: String!) {
  orders(channel: $channel, first: 20) {
    edges {
      node {
        id
        number
        created
        status
        total {
          gross {
            amount
            currency
          }
        }
        shippingAddress {
          firstName
          lastName
          streetAddress1
          streetAddress2
          city
          countryArea
          postalCode
          country {
            code
          }
        }
        lines {
          id
          productName
          variantName
          quantity
          totalPrice {
            gross {
              amount
              currency
            }
          }
          thumbnail {
            url
            alt
          }
        }
      }
    }
  }
}
```

### Checkout API

#### Creating a Checkout

```graphql
mutation CreateCheckout($checkoutInput: CheckoutCreateInput!) {
  checkoutCreate(input: $checkoutInput) {
    checkout {
      id
      token
      totalPrice {
        gross {
          amount
          currency
        }
      }
      subtotalPrice {
        gross {
          amount
          currency
        }
      }
      lines {
        id
        quantity
        variant {
          id
          name
          product {
            name
          }
        }
        totalPrice {
          gross {
            amount
            currency
          }
        }
      }
    }
    errors {
      field
      message
      code
    }
  }
}
```

Where `$checkoutInput` would include:

```json
{
  "channel": "netherlands",
  "email": "customer@example.com",
  "lines": [
    {
      "quantity": 1,
      "variantId": "UHJvZHVjdFZhcmlhbnQ6MjE3"
    }
  ],
  "languageCode": "NL"
}
```

## Authentication & Security

### JWT Authentication

All authenticated API requests will use JWT tokens:

```graphql
mutation TokenCreate($email: String!, $password: String!) {
  tokenCreate(email: $email, password: $password) {
    token
    refreshToken
    errors {
      field
      message
      code
    }
    user {
      id
      email
    }
  }
}
```

### Authorization Headers

Protected endpoints require the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Permission Structure

The API implements a role-based permission system:

1. **Anonymous Users**: Can browse products, categories, and create a checkout
2. **Authenticated Customers**: Can view their orders and manage their account
3. **Staff Users**: Can manage products, categories, and view orders based on their permissions
4. **Admin Users**: Have full access to all resources

### Rate Limiting

API access is subject to rate limiting:

- Anonymous users: 100 requests per minute
- Authenticated users: 300 requests per minute
- Staff/Admin users: 1000 requests per minute

Rate limit headers will be included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1620000000
```

## Multi-Region Implementation

### Channel-Based Operations

All region-specific operations must include the appropriate channel parameter:

| Region | Channel ID | Domain |
|--------|------------|--------|
| Netherlands | `netherlands` | nl.domain.com |
| Belgium | `belgium` | be.domain.com |
| Germany | `germany` | de.domain.com |

### Channel-Specific Mutations

When creating or updating region-specific data, include the channel in the mutation:

```graphql
mutation UpdateProductPricing($productId: ID!, $variants: [ProductVariantChannelListingUpdateInput!]!) {
  productVariantChannelListingUpdate(id: $productId, input: {
    variants: $variants
  }) {
    productVariants {
      id
      channelListings {
        channel {
          id
          name
        }
        price {
          amount
          currency
        }
      }
    }
    errors {
      field
      message
      code
    }
  }
}
```

## Multi-Language Implementation

### Language Parameter

All queries that fetch translatable content should include the language code:

```graphql
$languageCode: LanguageCodeEnum! # NL, DE, EN
```

### Creating Translations

Creating or updating translations uses dedicated mutations:

```graphql
mutation TranslateProduct($productId: ID!, $input: ProductTranslationInput!, $languageCode: LanguageCodeEnum!) {
  productTranslate(
    id: $productId,
    input: $input,
    languageCode: $languageCode
  ) {
    product {
      id
      name
      description
      translations {
        languageCode
        name
        description
      }
    }
    errors {
      field
      message
      code
    }
  }
}
```

## Best Practices

1. **Always Include Channel Context**: Ensure all queries include the appropriate channel parameter
2. **Handle Missing Translations**: Implement fallback strategies when translations aren't available
3. **Batch Operations**: Use bulk operations when possible to reduce API calls
4. **Error Handling**: Always check for and handle errors returned in the response
5. **Caching**: Implement appropriate caching for query responses
6. **Pagination**: Use cursor-based pagination for large collections

## Migration API Considerations

During the migration process, these API specifications will be used to:

1. **Extract data** from Statamic and Simple Commerce
2. **Transform data** to match Saleor's data model
3. **Load data** into Saleor using the appropriate mutations
4. **Validate data** to ensure successful migration

The migration scripts will need to handle:
- Channel-specific data for regional content
- Translations for all supported languages
- Proper relationships between entities

## API Documentation Tools

The API will be documented using:

1. **GraphQL Playground**: Available at the GraphQL endpoint for interactive exploration
2. **OpenAPI/Swagger**: For REST endpoints and integration points
3. **API Blueprint**: For high-level architectural documentation

## Next Steps

- Complete detailed mapping between Statamic data models and Saleor GraphQL mutations
- Develop and test migration scripts using these API specifications
- Implement client-side API integration in the Next.js frontend 