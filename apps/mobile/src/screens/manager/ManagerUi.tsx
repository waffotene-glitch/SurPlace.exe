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
}) {
  const color =
    tone === "muted"
      ? managerColors.textSoft
      : tone === "success"
        ? "#8ee2be"
        : tone === "danger"
          ? "#ffb3b3"
          : managerColors.textMuted;

  return <Text style={[styles.infoText, { color }]}>{children}</Text>;
}

export function ManagerLoading({ label }: { label: string }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={managerColors.accent} />
        <Text style={styles.loadingText}>{label}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: managerColors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: managerColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: managerColors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    color: managerColors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: managerColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: managerColors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: managerColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: managerColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: managerColors.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardAccent: {
    backgroundColor: managerColors.surfaceMuted,
    borderColor: managerColors.borderSoft,
  },
  metric: {
    flex: 1,
    minWidth: 92,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: managerColors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 10,
  },
  metricValue: {
    color: managerColors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  metricLabel: {
    color: managerColors.textSoft,
    fontSize: 12,
    marginTop: 6,
  },
  label: {
    color: "#e0e5f2",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: managerColors.border,
    backgroundColor: managerColors.surface,
    color: managerColors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  inputMultiline: {
    minHeight: 110,
  },
  inputLocked: {
    color: managerColors.textMuted,
  },
  buttonBase: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: managerColors.accent,
  },
  buttonSecondary: {
    backgroundColor: managerColors.surfaceMuted,
    borderWidth: 1,
    borderColor: managerColors.borderSoft,
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: managerColors.border,
  },
  buttonDanger: {
    backgroundColor: "#cf3d3d",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextOnAccent: {
    color: managerColors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  buttonTextDefault: {
    color: managerColors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: managerColors.borderSoft,
    backgroundColor: managerColors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: managerColors.textMuted,
    fontWeight: "700",
    fontSize: 12,
  },
  chipTextActive: {
    color: managerColors.text,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: managerColors.textMuted,
    marginTop: 14,
    textAlign: "center",
  },
});
