# Component Interfaces and Communication Patterns

This document defines the interfaces and communication patterns between all system components for the Statamic to Medusa.js migration project, with a focus on supporting multi-region and multi-language requirements.

## Communication Styles

The system employs several communication styles depending on the requirements:

1. **REST API** - Synchronous request-response pattern for core business operations
2. **GraphQL** - Flexible query-based communication for content retrieval
3. **Event-Driven** - Asynchronous communication for loosely coupled components
4. **Webhook** - Push-based notifications for external system integration
5. **Message Queue** - Reliable asynchronous communication for critical operations

## Core Interface Definitions

### 1. Frontend to Commerce (Next.js → Medusa.js)

**Interface Type**: REST API

**Key Endpoints**:
- `GET /products` - List products with filtering and pagination
- `GET /products/:id` - Get product details
- `POST /carts` - Create new cart
- `POST /carts/:id/line-items` - Add items to cart
- `POST /carts/:id/checkout` - Convert cart to order
- `GET /customers/:id/orders` - Retrieve customer order history

**Authentication**: JWT token or session cookie

**Data Format**: JSON

**Multi-Region Considerations**:
- Region identifier in request headers or URL
- Region-specific pricing and availability in responses
- Region-specific validation on cart operations

**Language Considerations**:
- Language code in request headers or URL
- Translated product information in responses
- Language-specific validation messages

**Example Request**:
```http
GET /products?region=nl&language=nl_NL&category=clothing
Authorization: Bearer <jwt_token>
```

**Example Response**:
```json
{
  "products": [
    {
      "id": "prod_01",
      "title": "Blauwe trui",
      "description": "Een warme trui voor de winter",
      "price": {
        "value": 4995,
        "currency_code": "EUR",
        "formatted": "€49,95"
      },
      "variants": [...]
    },
    ...
  ],
  "count": 20,
  "offset": 0,
  "limit": 10
}
```

### 2. Frontend to Content (Next.js → Strapi)

**Interface Type**: GraphQL / REST API

**Key GraphQL Queries**:
```graphql
query GetPage($slug: String!, $locale: String!) {
  pages(where: { slug: $slug }, locale: $locale) {
    id
    title
    content
    seo {
      metaTitle
      metaDescription
    }
    sections {
      __typename
      ... on ComponentHeroBanner {
        title
        description
        image {
          url
          alternativeText
        }
      }
      ... on ComponentProductGrid {
        title
        products
      }
    }
  }
}
```

**Key REST Endpoints**:
- `GET /api/pages?locale=nl_NL` - List pages for a locale
- `GET /api/pages/:id` - Get page details
- `GET /api/navigation?locale=nl_NL` - Get navigation structure for a locale

**Authentication**: JWT token for admin operations, public API for content retrieval

**Data Format**: JSON

**Multi-Region Considerations**:
- Region-specific content schemas
- Content filtering by region tag or category

**Language Considerations**:
- Content localization through Strapi's i18n system
- Language-specific slugs and URLs
- Fallback languages when content not available in requested language

**Example Request**:
```http
GET /api/pages/home?locale=nl_NL
```

**Example Response**:
```json
{
  "data": {
    "id": "1",
    "attributes": {
      "title": "Welkom bij onze winkel",
      "slug": "home",
      "content": "Ontdek onze nieuwste producten...",
      "locale": "nl_NL",
      "localizations": {
        "data": [
          {
            "attributes": {
              "locale": "en_US"
            }
          }
        ]
      },
      "sections": [...]
    }
  }
}
```

### 3. Commerce to Content (Medusa.js → Strapi)

**Interface Type**: REST API / Webhook

**Key Operations**:
- Update product-related content when products change
- Notify content system of commerce events
- Sync product availability across systems

**Authentication**: API Key

**Data Format**: JSON

**Example Integration Flow**:
1. Product is updated in Medusa.js
2. Webhook is triggered to Strapi endpoint
3. Strapi updates related content components
4. Content cache is invalidated

### 4. Internal Commerce Communication (Medusa.js Services)

**Interface Type**: Internal API / Event-Driven

**Key Events**:
- `order.created` - New order has been created
- `product.updated` - Product information has changed
- `cart.updated` - Shopping cart has been modified
- `customer.created` - New customer account created

**Event Schema Example**:
```json
{
  "event_name": "order.created",
  "id": "evt_123",
  "created_at": "2023-10-15T13:25:00Z",
  "data": {
    "order_id": "order_123",
    "customer_id": "cus_456",
    "region_id": "reg_nl",
    "total": 12995,
    "currency_code": "EUR",
    "items": [...]
  }
}
```

**Service Discovery**: Configuration-based service registry

**Failure Handling**: Event persistence with retry mechanism

### 5. Data Migration Interface

**Interface Type**: CLI / Batch Processing

**Key Commands**:
- `extract-collections --source=/path/to/statamic --output=/path/to/output`
- `transform-products --input=/path/to/data --output=/path/to/transformed`
- `import-products --input=/path/to/transformed --target=medusa`
- `validate-migration --source=/path/to/statamic --target=medusa --type=products`

**Data Format**: JSON / YAML transformation

**Multi-Region Handling**:
- Region mapping configuration
- Region-specific data extraction flags
- Region validation reports

**Language Handling**:
- Language mapping configuration
- Content translation validation
- Missing translation reports

## Communication Sequence Diagrams

### 1. Product Browsing Flow

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘
     │      Request        │                       │                     │
     │─────Product Page────►                       │                     │
     │                     │                       │                     │
     │                     │      GET /products    │                     │
     │                     │──────with region──────►                     │
     │                     │                       │                     │
     │                     │                       │    GET /products    │
     │                     │                       │────with region─────►│
     │                     │                       │                     │
     │                     │                       │   Products JSON     │
     │                     │                       │◄────with prices────┘
     │                     │                       │                     │
     │                     │   Products JSON       │                     │
     │                     │◄──with region prices──┘                     │
     │                     │                       │                     │
     │                     │  GET /api/product-    │                     │
     │                     │ content?locale=nl_NL  │                     │
     │                     │─────────────────────►│                     │
     │                     │                       │                     │
     │                     │                       │   GET /api/product  │
     │                     │                       │──content?locale=nl_NL─►
     │                     │                       │                     │
     │                     │                       │  Localized Content  │
     │                     │                       │◄────────JSON───────┘
     │                     │                       │                     │
     │                     │  Localized Content    │                     │
     │                     │◄────────JSON─────────┘                     │
     │                     │                       │                     │
     │    Render Page      │                       │                     │
     │◄────with Products───┘                       │                     │
     │                     │                       │                     │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│
└─────────┘          └────────────┘          └───────────┘          └────────┘
```

### 2. Checkout Flow

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐          ┌───────────┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│          │  Payment  │
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘          └─────┬─────┘
     │  Initiate Checkout   │                       │                     │                    │
     │────────────────────►│                       │                     │                    │
     │                     │                       │                     │                    │
     │                     │  POST /carts/:id/     │                     │                    │
     │                     │────checkout──────────►│                     │                    │
     │                     │                       │                     │                    │
     │                     │                       │  POST /carts/:id/   │                    │
     │                     │                       │──────checkout──────►│                    │
     │                     │                       │                     │                    │
     │                     │                       │                     │  Initialize        │
     │                     │                       │                     │───Payment Intent───►
     │                     │                       │                     │                    │
     │                     │                       │                     │  Payment Intent    │
     │                     │                       │                     │◄─────Created──────┘
     │                     │                       │                     │                    │
     │                     │                       │     Order with      │                    │
     │                     │                       │◄───Payment Intent───┘                    │
     │                     │                       │                     │                    │
     │                     │     Order with        │                     │                    │
     │                     │◄───Payment Intent─────┘                     │                    │
     │                     │                       │                     │                    │
     │   Redirect to       │                       │                     │                    │
     │◄──Payment Page──────┘                       │                     │                    │
     │                     │                       │                     │                    │
     │  Complete Payment   │                       │                     │                    │
     │───on Provider────────────────────────────────────────────────────────────────────────►│
     │                     │                       │                     │                    │
     │                     │                       │                     │  Payment Webhook   │
     │                     │                       │                     │◄───Confirmation────┘
     │                     │                       │                     │                    │
     │                     │                       │                     │  Update Order      │
     │                     │                       │                     │──Status──────────►│
     │                     │                       │                     │                    │
     │  Redirect to        │                       │                     │                    │
     │◄─Order Confirmation─┘                       │                     │                    │
     │                     │                       │                     │                    │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐          ┌─────┴─────┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│          │  Payment  │
└─────────┘          └────────────┘          └───────────┘          └────────┘          └───────────┘
```

### 3. Region/Language Selection

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐          ┌────────┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│          │ Strapi │
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘          └────┬───┘
     │  Select Region/Lang  │                       │                     │                    │
     │────────────────────►│                       │                     │                    │
     │                     │                       │                     │                    │
     │                     │  Store Preference     │                     │                    │
     │                     │──in Cookie/LocalStorage                     │                    │
     │                     │                       │                     │                    │
     │                     │  GET /regions/:id     │                     │                    │
     │                     │─────────────────────►│                     │                    │
     │                     │                       │                     │                    │
     │                     │                       │  GET /regions/:id   │                    │
     │                     │                       │───────────────────►│                    │
     │                     │                       │                     │                    │
     │                     │                       │   Region Settings   │                    │
     │                     │                       │◄───────────────────┘                    │
     │                     │                       │                     │                    │
     │                     │    Region Settings    │                     │                    │
     │                     │◄─────────────────────┘                     │                    │
     │                     │                       │                     │                    │
     │                     │  GET /api/site-config │                     │                    │
     │                     │────?locale=nl_NL─────►│                     │                    │
     │                     │                       │                     │                    │
     │                     │                       │ GET /api/site-config│                    │
     │                     │                       │─────?locale=nl_NL───────────────────────►
     │                     │                       │                     │                    │
     │                     │                       │  Localized Settings │                    │
     │                     │                       │◄────────────────────────────────────────┘
     │                     │                       │                     │                    │
     │                     │   Localized Settings  │                     │                    │
     │                     │◄─────────────────────┘                     │                    │
     │                     │                       │                     │                    │
     │  Reload Page with   │                       │                     │                    │
     │◄─New Region/Lang────┘                       │                     │                    │
     │                     │                       │                     │                    │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐          ┌────┴───┐
│  User   │          │  Frontend  │          │API Gateway│          │Medusa.js│          │ Strapi │
└─────────┘          └────────────┘          └───────────┘          └────────┘          └────────┘
```

## Error Handling Patterns

### 1. API Error Responses

All REST API errors follow this standardized format:

```json
{
  "status_code": 400,
  "error": "invalid_request",
  "message": "Invalid product ID format",
  "details": [
    {
      "field": "product_id",
      "message": "Must be a valid UUID"
    }
  ],
  "request_id": "req_123456"
}
```

Important considerations for multi-region and multi-language:
- Error messages should be localized based on the request language
- Region-specific validation errors should be clearly identified
- Request IDs should be included for troubleshooting

### 2. Event Processing Errors

For event-driven communication, error handling includes:

- Dead letter queues for failed event processing
- Event replay capabilities
- Structured error logging with correlation IDs
- Alerting for critical event failures

### 3. Frontend Error Handling

The frontend application implements:

- Global error boundaries with fallback UI
- Localized error messages
- Automatic retry for transient API errors
- Offline capability with optimistic updates
- Error telemetry for monitoring

## Security Patterns

### 1. Authentication Flows

**Customer Authentication**:
- JWT-based authentication
- Secure HTTP-only cookies
- CSRF protection
- Region-aware login endpoints

**API Authentication**:
- API Key authentication for service-to-service
- Rate limiting per API key
- Scoped access based on service needs

### 2. Data Protection

**Personal Data**:
- Encryption at rest for sensitive data
- Region-specific data storage when required by regulations
- Anonymization for analytics and reporting
- Structured logging with PII redaction

## Caching Strategy

### 1. CDN Caching

- Region-specific edge locations
- Cache control headers based on content type
- Separate cache keys for different languages
- Cache invalidation on content update

### 2. API Response Caching

- Cache hierarchies with different TTLs
- Cache varying by language and region
- Public vs. private cache designation
- Conditional requests with ETag/If-None-Match

## Conclusion

This document outlines the communication patterns between all system components for the Statamic to Medusa.js migration, with specific attention to supporting multiple regions and languages. These patterns provide a foundation for implementation teams to build a cohesive, maintainable system that meets the multi-region and multi-language requirements of the project. 