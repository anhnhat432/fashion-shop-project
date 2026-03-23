import React, { useCallback } from "react";
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

// Apply Roboto globally so all Text/TextInput without an explicit style
// automatically use Vietnamese-capable Roboto.
if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.style = [
  { fontFamily: "Roboto_400Regular" },
  Text.defaultProps.style,
];

if (!TextInput.defaultProps) TextInput.defaultProps = {};
TextInput.defaultProps.style = [
  { fontFamily: "Roboto_400Regular" },
  TextInput.defaultProps.style,
];

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const onReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Keep splash screen until fonts are ready
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer onReady={onReady}>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
