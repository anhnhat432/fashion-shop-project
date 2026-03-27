import { NativeModules, Platform } from "react-native";

const API_PORT = 5000;
const API_PATH = "api";
const EXPO_PUBLIC_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const getExpoHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;

  if (!scriptURL) return null;

  try {
    const parsed = new URL(scriptURL);
    const host = parsed.hostname;

    if (!host || host === "localhost" || host === "127.0.0.1") {
      return null;
    }

    return host;
  } catch (error) {
    return null;
  }
};

const resolveApiBaseUrl = () => {
  if (EXPO_PUBLIC_API_BASE_URL) {
    return EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }

  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${API_PORT}/${API_PATH}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}/${API_PATH}`;
  }

  return `http://localhost:${API_PORT}/${API_PATH}`;
};

export const API_BASE_URL = resolveApiBaseUrl();
