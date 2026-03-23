import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext();
const USER_STORAGE_KEY = "user";
export const useAuth = () => useContext(AuthContext);

const parseStoredUser = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    const cachedUser = parseStoredUser(storedUser);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        return setLoading(false);
      }

      if (cachedUser) {
        setUser(cachedUser);
      }

      const res = await api.get("/auth/me");
      setUser(res.data.data);
      await AsyncStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(res.data.data),
      );
    } catch (error) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        await AsyncStorage.multiRemove(["token", USER_STORAGE_KEY]);
        setUser(null);
      } else if (cachedUser) {
        setUser(cachedUser);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    await AsyncStorage.setItem("token", res.data.data.token);
    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(res.data.data.user),
    );
    setUser(res.data.data.user);
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    await AsyncStorage.setItem("token", res.data.data.token);
    await AsyncStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(res.data.data.user),
    );
    setUser(res.data.data.user);
  };

  const updateProfile = async (payload) => {
    const res = await api.put("/auth/me", payload);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.data));
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", USER_STORAGE_KEY]);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
