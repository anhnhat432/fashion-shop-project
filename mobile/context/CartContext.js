import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.size === item.size && p.color === item.color);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });
  };

  const updateQty = (index, change) => {
    setCartItems((prev) =>
      prev
        .map((item, idx) => (idx === index ? { ...item, quantity: Math.max(1, item.quantity + change) } : item))
    );
  };

  const removeItem = (index) => setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  const clearCart = () => setCartItems([]);

  return <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeItem, clearCart }}>{children}</CartContext.Provider>;
};
