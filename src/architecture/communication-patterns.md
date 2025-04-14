# Component Interfaces and Communication Patterns

This document defines the interfaces and communication patterns between system components for the Statamic to Saleor migration project, focusing on multi-region (Channels) and multi-language support.

## Communication Styles

The system primarily employs:

1.  **GraphQL** - Flexible query-based communication for core commerce and content operations via Saleor API.
2.  **Event-Driven** - Asynchronous communication using Saleor's event system for webhooks and internal decoupling.
3.  **Webhook** - Push-based notifications for external system integration (e.g., payment providers, fulfillment).

## Core Interface Definitions

### 1. Frontend to Backend (Next.js → Saleor)

**Interface Type**: GraphQL API (Saleor)

**Key Operations (Examples)**:
- Query products with filters (channel, category, attributes)
- Fetch product details with translations
- Create/update shopping cart (checkout in Saleor)
- Process checkout with payment
- Manage customer accounts and order history
- Fetch localized content (pages, product descriptions)

**Authentication**: JWT token (Saleor)

**Data Format**: JSON

**Multi-Region Considerations**:
- `channel` slug provided in GraphQL requests to target specific regions.
- Responses automatically filtered by channel (pricing, availability, shipping).

**Language Considerations**:
- `languageCode` argument in GraphQL queries for translations.
- Responses include translated fields where available.
- Fallback language handling configured in Saleor.

**Example Query**: 
```graphql
query GetProducts($channel: String!, $locale: LanguageCodeEnum!, $category: String) {
  products(channel: $channel, filter: { categories: [$category] }, first: 10) {
    edges {
      node {
        id
        name
        translation(languageCode: $locale) {
          name
          descriptionJson
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
        variants {
          # ... variant details
        }
      }
    }
  }
}
```

### 2. Internal Saleor Communication

**Interface Type**: Internal Function Calls / Event-Driven (Saleor Events/Webhooks)

**Key Events**: 
- `ORDER_CREATED`
- `PRODUCT_UPDATED`
- `CHECKOUT_UPDATED`
- `CUSTOMER_CREATED`
- `PAYMENT_CONFIRMED`

**Event Schema Example**: (Refer to Saleor Webhook documentation for exact structure)
```json
{
  "event_type": "ORDER_CREATED",
  "issued_at": "2023-10-15T13:25:00+00:00",
  "version": "3.x",
  "recipient": { ... }, 
  "order": {
    "id": "T3JkZXI6MTIz",
    "channel": { "slug": "nl" },
    "languageCode": "NL",
    "user": { ... },
    "total": { "gross": { "amount": 129.95, "currency": "EUR" } },
    "lines": [ ... ]
  }
}
```

**Failure Handling**: Configurable webhook retries in Saleor.

### 3. Data Migration Interface

**Interface Type**: CLI / Saleor API (GraphQL Mutations)

**Key Operations**:
- Extract Statamic data (products, customers, orders, content)
- Transform data to Saleor format (including Channel and Translation structure)
- Use Saleor GraphQL mutations (`productCreate`, `customerCreate`, `orderCreate`, etc.) to import data.
- Use Saleor CLI or custom scripts for batch processing.

**Data Format**: JSON/CSV input, GraphQL variables for import.

**Multi-Region Handling**:
- Assign imported products/data to appropriate Saleor Channels.

**Language Handling**:
- Import translated fields using Saleor's translation mutations.

## Communication Sequence Diagrams

### 1. Product Browsing Flow (Saleor)

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘
     │      Request        │                       │                     │
     │─────Product Page────►                       │                     │
     │                     │                       │                     │
     │                     │   GraphQL Product     │                     │
     │                     │─ Query (channel, lang)►                     │
     │                     │                       │                     │
     │                     │                       │  GraphQL Product    │
     │                     │                       │── Query────────────►│
     │                     │                       │                     │
     │                     │                       │   Product Data      │
     │                     │                       │◄(incl. translations)┘
     │                     │                       │                     │
     │                     │   Product Data        │                     │
     │                     │◄──(incl. translations)┘                     │
     │                     │                       │                     │
     │    Render Page      │                       │                     │
     │◄────with Products───┘                       │                     │
     │                     │                       │                     │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │
└─────────┘          └────────────┘          └───────────┘          └────────┘
```

### 2. Checkout Flow (Saleor)

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐          ┌───────────┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │          │  Payment  │
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘          └─────┬─────┘
     │  Initiate Checkout   │                       │                     │                    │
     │────────────────────►│                       │                     │                    │
     │                     │                       │                     │                    │
     │                     │   GraphQL Checkout    │                     │                    │
     │                     │──── Mutations────────►│                     │                    │
     │                     │                       │                     │                    │
     │                     │                       │ GraphQL Checkout    │                    │
     │                     │                       │──── Mutations──────►│                    │
     │                     │                       │                     │                    │
     │                     │                       │                     │  Initialize        │
     │                     │                       │                     │───Payment──────────►
     │                     │                       │                     │                    │
     │                     │                       │                     │  Payment Details   │
     │                     │                       │                     │◄───────────────────┘
     │                     │                       │                     │                    │
     │                     │                       │   Checkout Data     │                    │
     │                     │                       │◄─(incl. payment)────┘                    │
     │                     │                       │                     │                    │
     │                     │   Checkout Data       │                     │                    │
     │                     │◄──(incl. payment)─────┘                     │                    │
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
     │                     │                       │ Create/Update Order │                    │
     │                     │                       │───────────────────►│                    │
     │                     │                       │                     │                    │
     │  Redirect to        │                       │                     │                    │
     │◄─Order Confirmation─┘                       │                     │                    │
     │                     │                       │                     │                    │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐          ┌─────┴─────┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │          │  Payment  │
└─────────┘          └────────────┘          └───────────┘          └────────┘          └───────────┘
```

### 3. Region/Language Selection (Saleor)

```
┌─────────┐          ┌────────────┐          ┌───────────┐          ┌────────┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │
└────┬────┘          └─────┬──────┘          └─────┬─────┘          └────┬───┘
     │  Select Region/Lang  │                       │                     │
     │────────────────────►│                       │                     │
     │                     │                       │                     │
     │                     │  Store Preference     │                     │
     │                     │──in Cookie/LocalStorage                     │
     │                     │                       │                     │
     │                     │  Fetch Data with New  │                     │
     │                     │───Channel/Lang─────►│                     │
     │                     │                       │                     │
     │                     │                       │ Fetch Data with New │
     │                     │                       │── Channel/Lang────►│
     │                     │                       │                     │
     │                     │                       │  Region/Lang Data   │
     │                     │                       │◄───────────────────┘
     │                     │                       │                     │
     │                     │  Region/Lang Data     │                     │
     │                     │◄─────────────────────┘                     │
     │                     │                       │                     │
     │  Reload Page with   │                       │                     │
     │◄─New Region/Lang────┘                       │                     │
     │                     │                       │                     │
┌────┴────┐          ┌─────┴──────┐          ┌─────┴─────┐          ┌────┴───┐
│  User   │          │  Frontend  │          │API Gateway│          │ Saleor │
└─────────┘          └────────────┘          └───────────┘          └────────┘
```

## Error Handling Patterns

### 1. API Error Responses (GraphQL)

GraphQL errors are returned in the `errors` array of the response:

```json
{
  "errors": [
    {
      "message": "Invalid product ID.",
      "locations": [ { "line": 2, "column": 3 } ],
      "path": [ "product" ],
      "extensions": {
        "code": "INVALID",
        "field": "id"
      }
    }
  ],
  "data": null
}
```

Important considerations for multi-region and multi-language:
- Error messages can be localized using Saleor Apps or custom logic.
- Channel/language context should be included in logs for troubleshooting.

### 2. Event Processing Errors

For event-driven communication via Saleor Webhooks:

- Configurable retry policies within Saleor.
- Detailed logs accessible in Saleor Dashboard/API.
- Potential use of external message queues for guaranteed delivery if needed.

### 3. Frontend Error Handling

The frontend application implements:

- Global error boundaries with fallback UI.
- User-friendly error messages (potentially localized).
- Handling of GraphQL errors from Saleor.
- Offline capability with optimistic updates.
- Error telemetry for monitoring.

## Security Patterns

### 1. Authentication Flows

**Customer Authentication**: 
- Saleor JWT-based authentication.
- Secure HTTP-only cookies for tokens.
- CSRF protection handled by Saleor.
- Cross-domain authentication setup may require custom domain configuration.

**API Authentication**:
- Saleor Apps or Service Accounts for service-to-service communication.
- Fine-grained permissions defined in Saleor.

### 2. Data Protection

**Personal Data**:
- Handled according to Saleor's data model and GDPR features.
- Encryption at rest for sensitive data (database level).
- Anonymization features in Saleor.
- Structured logging with PII considerations.

## Caching Strategy

### 1. CDN Caching

- Region-specific edge locations.
- Cache control headers from Next.js/Saleor.
- Vary caching based on `Accept-Language` and potentially channel/domain.
- Cache invalidation triggered by Saleor webhooks or manual actions.

### 2. API Response Caching (GraphQL)

- Utilize caching within Apollo Client or similar libraries.
- Leverage Saleor's built-in caching where applicable.
- Consider edge caching for public GraphQL queries.
- Cache varying by language and channel.

## Conclusion

This document outlines the updated communication patterns for the Statamic to Saleor migration, focusing on Saleor's GraphQL API and event system. These patterns provide a foundation for building a cohesive system that meets the multi-region and multi-language requirements using the Saleor platform. 