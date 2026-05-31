import React from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export const managerColors = {
  background: "#0d152d",
  surface: "#111a36",
  surfaceMuted: "#182243",
  border: "#1f2b52",
  borderSoft: "#253563",
  text: "#ffffff",
  textMuted: "#aab8d6",
  textSoft: "#7a87a5",
  accent: "#ff6b00",
  success: "#2cc38a",
  danger: "#ff5a5a",
};

export function ManagerScreen({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
