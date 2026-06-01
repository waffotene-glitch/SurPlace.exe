import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "verified-food-token";
const USER_KEY = "verified-food-user";

export async function saveSession(token: string, user: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, user);
}

export async function getStoredSession() {
  const [token, user] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  return { token, user };
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

