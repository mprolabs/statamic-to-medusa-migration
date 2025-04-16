export enum LanguageCodeEnum {
  EN = 'EN',
  NL = 'NL',
  DE = 'DE',
  FR = 'FR'
}

export interface Image {
  url: string;
  alt?: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Price {
  gross: Money;
}

export interface PriceRange {
  start: Price;
}

export interface Pricing {
  priceRange: PriceRange;
  onSale: boolean;
  discount?: Price;
}

export interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
}

export interface Category extends CategoryBasic {
  description?: string;
  backgroundImage?: Image;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: Image;
  pricing?: Pricing;
  category?: CategoryBasic;
  seoTitle?: string;
  seoDescription?: string;
  media?: Image[];
  variants?: ProductVariant[];
}

export interface Attribute {
  id: string;
  name: string;
  slug: string;
}

export interface AttributeValue {
  id: string;
  name: string;
  value: string;
}

export interface SelectedAttribute {
  attribute: Attribute;
  values: AttributeValue[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  pricing?: {
    price?: Price;
  };
  attributes: SelectedAttribute[];
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface Edge<T> {
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ProductsResponse {
  products: Connection<Product>;
}

export interface CategoriesResponse {
  categories: Connection<Category>;
}

export interface ProductResponse {
  product: Product;
}

export interface CategoryWithProductsResponse {
  category: Category & {
    products: Connection<Product>;
  };
}

export interface ProductFilterInput {
  isPublished?: boolean;
  isAvailable?: boolean;
  search?: string;
  categories?: string[];
  price?: {
    gte?: number;
    lte?: number;
  };
}

export interface ProductSortInput {
  field: 'PRICE' | 'NAME' | 'PUBLISHED_AT';
  direction: 'ASC' | 'DESC';
}

export interface RegionConfig {
  code: string;
  name: string;
  domain: string;
  language: LanguageCodeEnum;
  channel: string;
  currency: string;
}

export interface AppContext {
  currentRegion: RegionConfig;
  currentLanguage: LanguageCodeEnum;
} 