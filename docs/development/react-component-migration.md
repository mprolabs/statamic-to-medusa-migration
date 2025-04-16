---
title: React Component Migration
parent: Development
nav_order: 5
---

# React Component Migration Guide

This document provides guidelines for migrating React class components to functional components with hooks, with specific focus on e-commerce components that may be encountered during the migration from legacy code to the modern Next.js codebase.

## Why Migrate to Functional Components?

1. **Simpler Code**: Functional components tend to be more concise and easier to read.
2. **Better Performance**: Functional components can have slightly better performance.
3. **Hooks API**: Access to React's powerful hooks API for state management and lifecycle effects.
4. **Reusable Logic**: Custom hooks provide a cleaner way to share logic between components.
5. **TypeScript Support**: Better TypeScript integration for type checking.
6. **Next.js Integration**: Better compatibility with Next.js features like Server Components.

## Basic Migration Pattern

### Class Component

```jsx
import React, { Component } from 'react';

class ProductCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false
    };
  }

  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  }

  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  }

  render() {
    const { product } = this.props;
    const { isHovered } = this.state;

    return (
      <div 
        className={`product-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.price}</p>
        <button>Add to Cart</button>
      </div>
    );
  }
}

export default ProductCard;
```

### Functional Component with Hooks

```jsx
import React, { useState } from 'react';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button>Add to Cart</button>
    </div>
  );
};

export default ProductCard;
```

## Lifecycle Method Migrations

### componentDidMount

Class Component:
```jsx
componentDidMount() {
  this.fetchProductData();
}
```

Functional Component:
```jsx
useEffect(() => {
  fetchProductData();
}, []); // Empty dependency array means it runs once on mount
```

### componentDidUpdate

Class Component:
```jsx
componentDidUpdate(prevProps) {
  if (prevProps.productId !== this.props.productId) {
    this.fetchProductData();
  }
}
```

Functional Component:
```jsx
useEffect(() => {
  fetchProductData();
}, [productId]); // Re-run when productId changes
```

### componentWillUnmount

Class Component:
```jsx
componentWillUnmount() {
  this.cancelPendingRequests();
}
```

Functional Component:
```jsx
useEffect(() => {
  return () => {
    cancelPendingRequests();
  };
}, []); // Cleanup function runs on unmount
```

## E-Commerce Component Examples

### Product Listing with Filtering

#### Class Component

```jsx
class ProductListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      filters: {
        category: null,
        minPrice: 0,
        maxPrice: 1000,
      },
      isLoading: true,
    };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.filters !== this.state.filters) {
      this.fetchProducts();
    }
  }

  fetchProducts = async () => {
    this.setState({ isLoading: true });
    try {
      const { category, minPrice, maxPrice } = this.state.filters;
      const response = await api.getProducts({ category, minPrice, maxPrice });
      this.setState({ products: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      this.setState({ isLoading: false });
    }
  };

  updateFilter = (filterName, value) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [filterName]: value,
      }
    }));
  };

  render() {
    const { products, filters, isLoading } = this.state;

    return (
      <div className="product-listing">
        <FilterPanel 
          filters={filters} 
          onFilterChange={this.updateFilter} 
        />
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  }
}
```

#### Functional Component

```jsx
const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: null,
    minPrice: 0,
    maxPrice: 1000,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { category, minPrice, maxPrice } = filters;
      const response = await api.getProducts({ category, minPrice, maxPrice });
      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  return (
    <div className="product-listing">
      <FilterPanel 
        filters={filters} 
        onFilterChange={updateFilter} 
      />
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Shopping Cart with Context

#### Class Component with Props Drilling

```jsx
// CartContext.js
export const CartContext = React.createContext();

export class CartProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      total: 0,
    };
  }

  addToCart = (product, quantity = 1) => {
    this.setState(prevState => {
      const existingItem = prevState.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update existing item
        const updatedItems = prevState.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
        
        return {
          items: updatedItems,
          total: this.calculateTotal(updatedItems),
        };
      } else {
        // Add new item
        const newItems = [...prevState.items, { ...product, quantity }];
        
        return {
          items: newItems,
          total: this.calculateTotal(newItems),
        };
      }
    });
  };

  removeFromCart = (productId) => {
    this.setState(prevState => {
      const updatedItems = prevState.items.filter(item => item.id !== productId);
      
      return {
        items: updatedItems,
        total: this.calculateTotal(updatedItems),
      };
    });
  };

  calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  render() {
    return (
      <CartContext.Provider 
        value={{
          items: this.state.items,
          total: this.state.total,
          addToCart: this.addToCart,
          removeFromCart: this.removeFromCart,
        }}
      >
        {this.props.children}
      </CartContext.Provider>
    );
  }
}
```

#### Functional Component with useContext and useReducer

```jsx
// cartReducer.js
export const initialState = {
  items: [],
  total: 0,
};

export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update existing item
        const updatedItems = state.items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
        
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      } else {
        // Add new item
        const newItems = [...state.items, { ...product, quantity }];
        
        return {
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    
    default:
      return state;
  }
};

// CartContext.js
import { createContext, useContext, useReducer } from 'react';
import { cartReducer, initialState } from './cartReducer';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  const addToCart = (product, quantity = 1) => {
    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { product, quantity } 
    });
  };
  
  const removeFromCart = (productId) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: productId 
    });
  };
  
  return (
    <CartContext.Provider 
      value={{
        items: state.items,
        total: state.total,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Usage in a component
const AddToCartButton = ({ product }) => {
  const { addToCart } = useCart();
  
  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
};

const CartSummary = () => {
  const { items, total } = useCart();
  
  return (
    <div>
      <p>Items: {items.length}</p>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
};
```

## Best Practices for Migration

1. **Incremental Migration**: Migrate one component at a time rather than attempting to migrate the entire codebase at once.

2. **Test After Each Migration**: Write and run tests to ensure the migrated component still works as expected.

3. **Use Custom Hooks**: Extract reusable logic into custom hooks for better organization and reuse.

4. **TypeScript**: Consider adding TypeScript during migration for improved type safety.

5. **Consider Server Components**: For Next.js 13+, evaluate whether the component can be a Server Component.

6. **Maintain Prop API**: Keep the same prop API to minimize changes in parent components.

7. **Refactor Render Props and HOCs**: Replace render props and higher-order components with hooks where possible.

## Troubleshooting Common Migration Issues

### Infinite Re-rendering

**Problem**: Component re-renders infinitely after migration.

**Solution**: Check dependency arrays in `useEffect` hooks. Ensure objects and functions are memoized with `useMemo` and `useCallback`.

### State Updates After Unmount

**Problem**: Warning about updating state on unmounted component.

**Solution**: Use cleanup functions in `useEffect` to cancel pending operations:

```jsx
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setState(data);
    }
  });
  
  return () => {
    isMounted = false;
  };
}, [fetchData]);
```

### Event Handler Issues

**Problem**: Event handlers losing `this` context or not updating with state changes.

**Solution**: Ensure event handlers are defined properly and use functional state updates when necessary:

```jsx
// Use functional update when new state depends on previous state
setCount(prevCount => prevCount + 1);
```

## Conclusion

Migrating from class components to functional components with hooks can significantly improve code quality and maintainability. By following the patterns outlined in this guide, you can efficiently update your e-commerce components to use modern React practices while maintaining their functionality.

For more complex migration scenarios, consider breaking down the component into smaller, more focused components before migrating to make the process more manageable. 