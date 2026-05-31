import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ReviewDraftProvider } from "./src/context/ReviewDraftContext";
import { ReviewRefreshProvider } from "./src/context/ReviewRefreshContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ReviewRefreshProvider>
          <ReviewDraftProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </ReviewDraftProvider>
        </ReviewRefreshProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
