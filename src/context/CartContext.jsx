import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (pizza) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === pizza.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...pizza, quantity: 1 }];
    });
  };

  const removeFromCart = (pizzaId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== pizzaId)
    );
  };

  const updateQuantity = (pizzaId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pizzaId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === pizzaId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    toggleCart,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
