import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import * as SplashScreen from "expo-splash-screen";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Apply Roboto globally so all Text/TextInput without an explicit style
// automatically use Vietnamese-capable Roboto.
if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [
  { fontFamily: "Roboto_400Regular" },
  Text.defaultProps.style,
];

if (!TextInput.defaultProps) TextInput.defaultProps = {};
TextInput.defaultProps = {
  ...TextInput.defaultProps,
  disableFullscreenUI: true,
};

TextInput.defaultProps.style = [
  { fontFamily: "Roboto_400Regular" },
  TextInput.defaultProps.style,
];

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Ignore repeated or unsupported splash calls on some Android builds.
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    setAppReady(true);
    SplashScreen.hideAsync().catch(() => {
      // Ignore hide failures so the app can continue rendering.
    });
  }, [fontError, fontsLoaded]);

  if (!appReady) return null;

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
