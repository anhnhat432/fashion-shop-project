import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/auth/me/wishlist");
      setWishlistItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isWishlisted = (productId) =>
    wishlistItems.some((item) => item._id === productId);

  const toggleWishlist = async (product) => {
    if (!user || !product?._id) {
      return false;
    }

    if (isWishlisted(product._id)) {
      await api.delete(`/auth/wishlist/${product._id}`);
    } else {
      await api.post(`/auth/wishlist/${product._id}`);
    }

    await refreshWishlist();
    return true;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        refreshWishlist,
        isWishlisted,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
