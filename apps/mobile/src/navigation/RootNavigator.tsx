import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LoadingState } from "../components/AppUi";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { OnboardingIntroScreen } from "../screens/auth/OnboardingIntroScreen";
import { OnboardingVisualMenusScreen } from "../screens/auth/OnboardingVisualMenusScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";
import { ManagerDashboardScreen } from "../screens/manager/ManagerDashboardScreen";
import { ManagerPlatesScreen } from "../screens/manager/ManagerPlatesScreen";
import { ManagerRestaurantScreen } from "../screens/manager/ManagerRestaurantScreen";
import { FeedScreen } from "../screens/user/FeedScreen";
import { HomeScreen } from "../screens/user/HomeScreen";
import { PlateDetailsScreen } from "../screens/user/PlateDetailsScreen";
import { RestaurantDetailsScreen } from "../screens/user/RestaurantDetailsScreen";
import { ReviewCameraScreen } from "../screens/user/ReviewCameraScreen";
import { ReviewCreateScreen } from "../screens/user/ReviewCreateScreen";
import { getHasSeenOnboarding, setHasSeenOnboarding } from "../services/onboardingStorage";
import { managerColors } from "../screens/manager/ManagerUi";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const UserTab = createBottomTabNavigator();
const UserStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const ManagerTab = createBottomTabNavigator();
const USER_ACCENT = "#f26b3a";
const USER_MUTED = "#8c877c";

function getUserTabIcon(routeName: string, focused: boolean) {
  const color = focused ? USER_ACCENT : USER_MUTED;
  const size = focused ? 24 : 22;

  if (routeName === "Discover") {
    return <Ionicons name={focused ? "compass" : "compass-outline"} size={size} color={color} />;
  }

  if (routeName === "Feed") {
    return <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={size} color={color} />;
  }

  return <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={size} color={color} />;
}

function getManagerTabIcon(routeName: string, focused: boolean) {
  const color = focused ? managerColors.accent : managerColors.textSoft;
  const size = focused ? 24 : 22;

  if (routeName === "Dashboard") {
    return <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />;
  }

  if (routeName === "Restaurant") {
    return <Ionicons name={focused ? "storefront" : "storefront-outline"} size={size} color={color} />;
  }

  if (routeName === "Plates") {
    return <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={size} color={color} />;
  }

  return <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={size} color={color} />;
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator({ onComplete }: { onComplete: () => void }) {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="OnboardingIntro">
        {(props) => <OnboardingIntroScreen {...props} onSkip={onComplete} />}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="OnboardingVisualMenus">
        {(props) => <OnboardingVisualMenusScreen {...props} onComplete={onComplete} />}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Home" }} />
      <UserStack.Screen
        name="RestaurantDetails"
        component={RestaurantDetailsScreen}
        options={{ title: "Restaurant" }}
      />
      <UserStack.Screen
        name="PlateDetails"
        component={PlateDetailsScreen}
        options={{ title: "Plate" }}
      />
      <UserStack.Screen
        name="ReviewCreate"
        component={ReviewCreateScreen}
        options={{ title: "Write Review" }}
      />
      <UserStack.Screen
        name="ReviewCamera"
        component={ReviewCameraScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </UserStack.Navigator>
  );
}

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator>
      <FeedStack.Screen name="FeedMain" component={FeedScreen} options={{ title: "Feed" }} />
      <FeedStack.Screen
        name="RestaurantDetails"
        component={RestaurantDetailsScreen}
        options={{ title: "Restaurant" }}
      />
      <FeedStack.Screen
        name="PlateDetails"
        component={PlateDetailsScreen}
        options={{ title: "Plate" }}
      />
      <FeedStack.Screen
        name="ReviewCreate"
        component={ReviewCreateScreen}
        options={{ title: "Write Review" }}
      />
      <FeedStack.Screen
        name="ReviewCamera"
        component={ReviewCameraScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />
    </FeedStack.Navigator>
  );
}

function UserNavigator() {
  return (
    <UserTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getUserTabIcon(route.name, focused),
        tabBarActiveTintColor: USER_ACCENT,
        tabBarInactiveTintColor: USER_MUTED,
        tabBarLabelStyle: {
          fontWeight: "800",
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarStyle: {
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#fffaf5",
          borderTopColor: "#eadfd4",
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <UserTab.Screen name="Discover" component={HomeStackNavigator} />
      <UserTab.Screen name="Feed" component={FeedStackNavigator} />
      <UserTab.Screen name="Profile" component={ProfileScreen} />
    </UserTab.Navigator>
  );
}

function ManagerNavigator() {
  return (
    <ManagerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getManagerTabIcon(route.name, focused),
        tabBarStyle: {
          backgroundColor: "#060a17",
          borderTopColor: "#121c38",
          paddingTop: 8,
          paddingBottom: 10,
          height: 76,
        },
        tabBarActiveTintColor: managerColors.accent,
        tabBarInactiveTintColor: managerColors.textSoft,
        tabBarLabelStyle: {
          fontWeight: "800",
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <ManagerTab.Screen name="Dashboard" component={ManagerDashboardScreen} />
      <ManagerTab.Screen name="Restaurant" component={ManagerRestaurantScreen} />
      <ManagerTab.Screen name="Plates" component={ManagerPlatesScreen} />
      <ManagerTab.Screen name="Profile" component={ProfileScreen} />
    </ManagerTab.Navigator>
  );
}

export function RootNavigator() {
  const { isLoading, user } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState<boolean | null>(null);

  const loadOnboardingFlag = async () => {
    const seen = await getHasSeenOnboarding();
    setHasSeenOnboardingState(seen);
  };

  useEffect(() => {
    void loadOnboardingFlag();
  }, [user]);

  const completeOnboarding = async () => {
    await setHasSeenOnboarding(true);
    setHasSeenOnboardingState(true);
  };

  if (isLoading || hasSeenOnboarding === null) {
    return <LoadingState label="Restoring session..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === "manager" ? (
          <RootStack.Screen name="ManagerApp" component={ManagerNavigator} />
        ) : (
          <RootStack.Screen name="UserApp" component={UserNavigator} />
        )
      ) : !hasSeenOnboarding ? (
        <RootStack.Screen name="Onboarding">
          {() => <OnboardingNavigator onComplete={() => void completeOnboarding()} />}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
