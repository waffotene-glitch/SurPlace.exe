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

