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
}

export function ManagerHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function ManagerSectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ManagerCard({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return <View style={[styles.card, accent ? styles.cardAccent : null]}>{children}</View>;
}

export function ManagerMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function ManagerLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function ManagerInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  editable = true,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={managerColors.textSoft}
      multiline={multiline}
      editable={editable}
      style={[
        styles.input,
        multiline ? styles.inputMultiline : null,
        !editable ? styles.inputLocked : null,
      ]}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

export function ManagerButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const buttonStyle =
    variant === "secondary"
      ? styles.buttonSecondary
      : variant === "ghost"
        ? styles.buttonGhost
        : variant === "danger"
          ? styles.buttonDanger
          : styles.buttonPrimary;
  const textStyle =
    variant === "primary" || variant === "danger"
      ? styles.buttonTextOnAccent
      : styles.buttonTextDefault;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttonBase, buttonStyle, disabled ? styles.buttonDisabled : null]}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function ManagerChip({
  label,
  active = false,
  onPress,
  tone = "default",
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: "default" | "success" | "danger";
}) {
  const activeColor =
    tone === "success"
      ? managerColors.success
      : tone === "danger"
        ? managerColors.danger
        : managerColors.accent;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? {
              backgroundColor: activeColor,
              borderColor: activeColor,
            }
          : null,
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function ManagerInfoText({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "muted" | "success" | "danger";
