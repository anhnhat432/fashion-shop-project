import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppTabs from "./AppTabs";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import WishlistScreen from "../screens/WishlistScreen";
import { FONTS } from "../constants/fonts";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ActivityIndicator size="large" />
        <Text>Đang tải tài khoản...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animation: "slide_from_right",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#f8efe6" },
        headerTitleStyle: {
          fontFamily: FONTS.bold,
          fontSize: 18,
          color: "#111827",
        },
        headerTintColor: "#111827",
        contentStyle: { backgroundColor: "#f3f5f7" },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Đăng ký" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={AppTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "Chi tiết sản phẩm" }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ title: "Thanh toán" }}
          />
          <Stack.Screen
            name="OrderHistory"
            component={OrderHistoryScreen}
            options={{ title: "Lịch sử đơn hàng" }}
          />
          <Stack.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{ title: "Wishlist" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
