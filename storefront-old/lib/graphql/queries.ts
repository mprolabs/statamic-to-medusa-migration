import { gql } from '@apollo/client';

// Base product fragment with common fields
export const PRODUCT_FRAGMENT = gql`
  fragment ProductFragment on Product {
    id
    name
    slug
    description
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
      onSale
      discount {
        gross {
          amount
          currency
        }
      }
    }
    category {
      id
      name
      slug
    }
  }
`;

// Query to fetch featured products
export const GET_FEATURED_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetFeaturedProducts($channel: String!, $languageCode: LanguageCodeEnum!) {
    products(
      first: 8,
      channel: $channel,
      filter: { isPublished: true, isAvailable: true }
      languageCode: $languageCode
    ) {
      edges {
        node {
          ...ProductFragment
        }
      }
    }
  }
`;

// Query to fetch products with filtering
export const GET_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetProducts(
    $first: Int!,
    $after: String,
    $channel: String!,
    $languageCode: LanguageCodeEnum!,
    $filter: ProductFilterInput,
    $sortBy: ProductOrderField,
    $sortDirection: OrderDirection
  ) {
    products(
      first: $first,
      after: $after,
      channel: $channel,
      filter: $filter,
      sortBy: { field: $sortBy, direction: $sortDirection }
      languageCode: $languageCode
    ) {
      edges {
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;

// Query to fetch product details
export const GET_PRODUCT_DETAILS = gql`
  ${PRODUCT_FRAGMENT}
  query GetProductDetails($slug: String!, $channel: String!, $languageCode: LanguageCodeEnum!) {
    product(slug: $slug, channel: $channel, languageCode: $languageCode) {
      ...ProductFragment
      seoTitle
      seoDescription
      media {
        url
        alt
      }
      variants {
        id
        name
        sku
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
            id
            name
            slug
          }
          values {
            id
            name
            value
          }
        }
      }
    }
  }
`;

// Query to fetch categories
export const GET_CATEGORIES = gql`
  query GetCategories($first: Int!, $channel: String!, $languageCode: LanguageCodeEnum!) {
    categories(
      first: $first,
      channel: $channel,
      languageCode: $languageCode
    ) {
      edges {
        node {
          id
          name
          slug
          backgroundImage {
            url
            alt
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// Query to fetch category details with products
export const GET_CATEGORY_WITH_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetCategoryWithProducts(
    $slug: String!,
    $first: Int!,
    $after: String,
    $channel: String!,
    $languageCode: LanguageCodeEnum!
  ) {
    category(
      slug: $slug,
      channel: $channel,
      languageCode: $languageCode
    ) {
      id
      name
      slug
      description
      seoTitle
      seoDescription
      backgroundImage {
        url
        alt
      }
      products(first: $first, after: $after) {
        edges {
          node {
            ...ProductFragment
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
      }
    }
  }
`; 