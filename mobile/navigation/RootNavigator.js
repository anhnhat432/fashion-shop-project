import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

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
    <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
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
            name="Home"
            component={HomeScreen}
            options={{ title: "Fashion Shop" }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "Chi tiết sản phẩm" }}
          />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ title: "Giỏ hàng" }}
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
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Tài khoản" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
