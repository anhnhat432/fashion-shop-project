import React from "react";
import { Text, View } from "react-native";
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

  if (!cartCount) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        right: -8,
        top: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 999,
        backgroundColor: "#9a3412",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{ color: "#fff", fontSize: 10, fontFamily: FONTS.bold }}
      >
        {cartCount > 9 ? "9+" : cartCount}
      </Text>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#fffaf5",
          borderTopColor: "#ead9ca",
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Khám phá" }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: "Giỏ đồ" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}