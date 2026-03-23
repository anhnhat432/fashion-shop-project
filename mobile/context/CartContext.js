import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = "fashion-shop-cart";

const getAvailableStock = (item) => {
  const stock = Number(item.availableStock);

  if (!Number.isFinite(stock) || stock < 0) {
    return null;
  }

  return stock;
};

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
    const requestedQuantity = Math.max(1, Number(item.quantity || 1));
    const availableStock = getAvailableStock(item);
    let result = {
      addedQuantity: requestedQuantity,
      quantity: requestedQuantity,
      capped: false,
      outOfStock: availableStock === 0,
    };

    if (availableStock === 0) {
      return result;
    }

    setCartItems((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.color === item.color,
      );

      if (idx >= 0) {
        const copy = [...prev];
        const currentQuantity = Number(copy[idx].quantity || 0);
        const nextQuantity =
          availableStock === null
            ? currentQuantity + requestedQuantity
            : Math.min(currentQuantity + requestedQuantity, availableStock);

        result = {
          addedQuantity: Math.max(0, nextQuantity - currentQuantity),
          quantity: nextQuantity,
          capped:
            availableStock !== null &&
            nextQuantity < currentQuantity + requestedQuantity,
          outOfStock: nextQuantity === currentQuantity,
        };

        copy[idx] = {
          ...copy[idx],
          ...item,
          quantity: nextQuantity,
          availableStock,
        };
        return copy;
      }

      const nextQuantity =
        availableStock === null
          ? requestedQuantity
          : Math.min(requestedQuantity, availableStock);

      result = {
        addedQuantity: nextQuantity,
        quantity: nextQuantity,
        capped: availableStock !== null && nextQuantity < requestedQuantity,
        outOfStock: nextQuantity === 0,
      };

      if (nextQuantity === 0) {
        return prev;
      }

      return [
        ...prev,
        {
          ...item,
          quantity: nextQuantity,
          availableStock,
        },
      ];
    });

    return result;
  };

  const updateQty = (index, change) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              quantity:
                getAvailableStock(item) === null
                  ? Math.max(1, item.quantity + change)
                  : Math.max(
                      1,
                      Math.min(item.quantity + change, getAvailableStock(item)),
                    ),
            }
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
