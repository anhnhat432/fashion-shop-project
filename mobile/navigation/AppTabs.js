import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useCart } from "../context/CartContext";
import { FONTS } from "../constants/fonts";

const Tab = createBottomTabNavigator();

function CartBadge() {
  const { cartCount } = useCart();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount && cartCount !== prevCount.current) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.35,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
      ]).start();
    }
    prevCount.current = cartCount;
  }, [cartCount, scaleAnim]);

  if (!cartCount) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        right: -8,
        top: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 999,
        backgroundColor: "#4f46e5",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Text style={{ color: "#fff", fontSize: 10, fontFamily: FONTS.bold }}>
        {cartCount > 9 ? "9+" : cartCount}
      </Text>
    </Animated.View>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 11,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconMap = {
            Home: focused ? "sparkles" : "sparkles-outline",
            Cart: focused ? "bag-handle" : "bag-handle-outline",
            Profile: focused ? "person-circle" : "person-circle-outline",
          };

          return (
            <View style={{ position: "relative" }}>
              <Ionicons name={iconMap[route.name]} size={22} color={color} />
              {route.name === "Cart" ? <CartBadge /> : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Khám phá" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Giỏ hàng" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Tài khoản" }}
      />
    </Tab.Navigator>
  );
}
