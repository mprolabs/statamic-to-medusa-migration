---
layout: default
title: API Details
description: API documentation for the Saleor commerce platform with multi-region and multi-language capabilities
parent: Architecture
permalink: /architecture/api/
---

# Saleor API Documentation

The Saleor commerce platform provides a comprehensive GraphQL API for all commerce operations. This document outlines the key API patterns with a focus on multi-region and multi-language support.

## API Structure

Saleor uses GraphQL as its primary API interface, providing a single endpoint for all operations:

```
https://[your-saleor-instance]/graphql/
```

## Authentication

Saleor supports multiple authentication methods:

### JWT Authentication

```graphql
mutation {
  tokenCreate(email: "user@example.com", password: "password") {
    token
    refreshToken
    errors {
      field
      message
    }
  }
}
```

### Requesting with Authentication

```javascript
fetch('https://[your-saleor-instance]/graphql/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    query: `
      query {
        me {
          id
          email
        }
      }
    `
  })
})
```

## Multi-Region Support

### Channel-Based API Queries

Saleor implements multi-region support through Channels. Each channel represents a separate region:

```graphql
query {
  channels {
    edges {
      node {
        id
        name
        slug
        currencyCode
        defaultCountry {
          code
          country
        }
      }
    }
  }
}
```

### Channel-Specific Queries

Most queries in Saleor support a channel parameter to retrieve data specific to a region:

```graphql
query {
  products(channel: "netherlands", first: 10) {
    edges {
      node {
        id
        name
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
      }
    }
  }
}
```

### Channel-Specific Mutations

When creating or updating data, you can specify the channel context:

```graphql
mutation {
  productChannelListingUpdate(
    id: "UHJvZHVjdDo0Nw==",
    input: {
      updateChannels: [
        {
          channelId: "Q2hhbm5lbDox", # Netherlands channel
          isPublished: true,
          visibleInListings: true,
          isAvailableForPurchase: true,
          addVariants: ["UHJvZHVjdFZhcmlhbnQ6MjE3"]
        },
        {
          channelId: "Q2hhbm5lbDoy", # Belgium channel
          isPublished: true,
          visibleInListings: false,
          isAvailableForPurchase: true,
          addVariants: ["UHJvZHVjdFZhcmlhbnQ6MjE3"]
        }
      ]
    }
  ) {
    product {
      id
      name
    }
  }
}
```

## Multi-Language Support

### Translation Queries

Saleor provides translation capabilities for most content entities:

```graphql
query {
  products(first: 5) {
    edges {
      node {
        id
        name
        translation(languageCode: NL) {
          name
          description
        }
      }
    }
  }
}
```

### Adding Translations

You can add translations for products and other content through mutations:

```graphql
mutation {
  productTranslate(
    id: "UHJvZHVjdDo0Nw==",
    input: {
      languageCode: DE,
      name: "Produktname auf Deutsch",
      description: "Produktbeschreibung auf Deutsch"
    }
  ) {
    product {
      id
      name
      translations {
        languageCode
        name
      }
    }
  }
}
```

## Core API Endpoints for Multi-Region Support

### Products with Channel Context

```graphql
query {
  products(first: 10, channel: "netherlands") {
    edges {
      node {
        id
        name
        description
        slug
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
        }
        thumbnail {
          url
        }
      }
    }
  }
}
```

### Categories with Translations

```graphql
query {
  categories(first: 10) {
    edges {
      node {
        id
        name
        slug
        description
        translation(languageCode: NL) {
          name
          description
        }
        backgroundImage {
          url
        }
        ancestors(first: 5) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
```

### Checkout with Channel Context

```graphql
# Create checkout with channel context
mutation {
  checkoutCreate(
    input: {
      channel: "netherlands",
      lines: [{ variantId: "UHJvZHVjdFZhcmlhbnQ6Mg==", quantity: 1 }],
      email: "customer@example.com"
    }
  ) {
    checkout {
      id
      token
      totalPrice {
        gross {
          amount
          currency
        }
      }
    }
    errors {
      field
      message
    }
  }
}
```

### Orders with Channel Context

```graphql
query {
  orders(channel: "netherlands", first: 10) {
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
        lines {
          productName
          quantity
        }
      }
    }
  }
}
```

## Channel-Specific API Patterns

### Getting Available Shipping Methods

```graphql
query {
  shippingMethods(channel: "netherlands") {
    id
    name
    price {
      amount
      currency
    }
    minimumOrderPrice {
      amount
      currency
    }
    maximumOrderPrice {
      amount
      currency
    }
  }
}
```

### Getting Available Payment Gateways

```graphql
query {
  paymentGateways(channel: "netherlands") {
    id
    name
    currencies
    config {
      field
      value
    }
  }
}
```

## Recommended API Implementation Patterns

When implementing the frontend to work with Saleor's API, consider these patterns for multi-region and multi-language support:

### 1. Channel Context Awareness

Always include the channel parameter in queries to ensure region-specific data:

```javascript
const GET_PRODUCTS = gql`
  query GetProducts($channel: String!) {
    products(first: 10, channel: $channel) {
      edges {
        node {
          id
          name
          # Other fields...
        }
      }
    }
  }
`;

// Usage
client.query({
  query: GET_PRODUCTS,
  variables: {
    channel: currentChannel // e.g., "netherlands"
  }
});
```

### 2. Language Context in Queries

Include language code in queries when fetching translations:

```javascript
const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($id: ID!, $channel: String!, $languageCode: LanguageCodeEnum!) {
    product(id: $id, channel: $channel) {
      id
      name
      description
      translation(languageCode: $languageCode) {
        name
        description
      }
      # Other fields...
    }
  }
`;

// Usage
client.query({
  query: GET_PRODUCT_DETAILS,
  variables: {
    id: productId,
    channel: currentChannel,
    languageCode: currentLanguage // e.g., "NL"
  }
});
```

### 3. Fallback Strategies

Implement fallback strategies when translations are not available:

```javascript
// Example React component using translations with fallback
function ProductName({ product, languageCode }) {
  return (
    <h1>
      {product.translation && product.translation.name
        ? product.translation.name
        : product.name}
    </h1>
  );
}
```

## API Documentation References

For complete API documentation, refer to:

1. [Saleor GraphQL API Documentation](https://docs.saleor.io/docs/3.x/api-reference/)
2. [Saleor API Playground](https://demo.saleor.io/graphql/) 