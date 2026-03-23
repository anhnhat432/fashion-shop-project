import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = "fashion-shop-cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        }
      } catch (error) {
        await AsyncStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.color === item.color,
      );
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
      prev.map((item, idx) =>
        idx === index
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  };

  const removeItem = (index) =>
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  const clearCart = () => setCartItems([]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        hydrated,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
