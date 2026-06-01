import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "verified-food-has-seen-onboarding";

export async function getHasSeenOnboarding() {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === "true";
}

export async function setHasSeenOnboarding(value: boolean) {
  await SecureStore.setItemAsync(ONBOARDING_KEY, value ? "true" : "false");
}

export async function clearHasSeenOnboarding() {
  await SecureStore.deleteItemAsync(ONBOARDING_KEY);
}
