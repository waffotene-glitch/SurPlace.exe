import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const authColors = {
  white: "#ffffff",
  ink: "#001e36",
  text: "#333333",
  muted: "#666666",
  faint: "#999999",
  border: "#e8e8e8",
  soft: "#f5f5f5",
  page: "#f5f5f5",
  orange: "#ff6b00",
  navy: "#1c3b8b",
  navySoft: "#34495e",
  overlay: "rgba(0, 0, 0, 0.45)",
};

export function AuthScaffold({
  backgroundUri,
  children,
}: {
  backgroundUri: string;
  children: React.ReactNode;
}) {
  return (
    <ImageBackground source={{ uri: backgroundUri }} style={styles.backgroundImage} blurRadius={8}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardWrap}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.brandBlock}>
                <Text style={styles.brand}>SURPLACE</Text>
              </View>
              <View style={styles.card}>{children}</View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

export function AuthPlainScaffold({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.plainSafeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.plainScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  icon,
  rightIcon,
  onRightIconPress,
  lightLabel = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  lightLabel?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, lightLabel ? styles.fieldLabelLight : null]}>{label}</Text>
      <View style={[styles.inputShell, multiline ? styles.inputShellMultiline : null]}>
        {icon ? <View style={styles.inputIcon}>{icon}</View> : null}
        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a0a0a0"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightAction}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function AuthPrimaryButton({
  label,
  onPress,
  disabled,
  tone = "orange",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "orange" | "navy";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.primaryButton,
        tone === "navy" ? styles.primaryButtonNavy : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function AuthSecondaryButton({
  label,
  onPress,
  tone = "light",
}: {
  label: string;
  onPress: () => void;
  tone?: "light" | "navy";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.secondaryButton, tone === "navy" ? styles.secondaryButtonNavy : null]}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          tone === "navy" ? styles.secondaryButtonTextOnNavy : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export function AuthHelper({ children }: { children: React.ReactNode }) {
  return <Text style={styles.helperText}>{children}</Text>;
}

export function AuthFooterLink({
  prompt,
  action,
  onPress,
  light = false,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
  light?: boolean;
}) {
  return (
    <View style={styles.footerRow}>
      <Text style={[styles.footerPrompt, light ? styles.footerPromptLight : null]}>{prompt} </Text>
      <Pressable onPress={onPress}>
        <Text style={styles.footerAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

export function AuthTopHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.topHeader}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={28} color={authColors.ink} />
      </Pressable>
      <Text style={styles.topBrand}>SURPLACE</Text>
      <Text style={styles.topTitle}>{title}</Text>
      <Text style={styles.topSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function AuthFormCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.formCard}>
      {title ? <Text style={styles.formCardTitle}>{title}</Text> : null}
      {subtitle ? <Text style={styles.formCardSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function AuthRoleCard({
  title,
  subtitle,
  active,
  onPress,
  type,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
  type: "user" | "manager";
}) {
  const accentColor = type === "user" ? authColors.orange : authColors.navy;
  const cardBorderColor = active ? accentColor : "#d8dee7";
  const iconBackground = active
    ? accentColor
    : type === "user"
      ? "#fff1e8"
      : "#edf3ff";
  const iconColor = active ? authColors.white : accentColor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleCard,
        {
          borderColor: cardBorderColor,
          backgroundColor: authColors.white,
        },
        active ? styles.roleCardActive : null,
      ]}
    >
      <View style={styles.roleCardContent}>
        <View style={styles.roleCardTopRow}>
          <View style={[styles.roleIconCircle, { backgroundColor: iconBackground, borderColor: `${accentColor}33` }]}>
            {type === "user" ? (
              <Feather name="compass" size={22} color={iconColor} />
            ) : (
              <MaterialCommunityIcons name="storefront-outline" size={24} color={iconColor} />
            )}
          </View>
          <View
            style={[
              styles.roleBadge,
              active
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : styles.roleBadgeIdle,
            ]}
          >
            {active ? <Feather name="check" size={14} color={authColors.white} /> : null}
            <Text
              style={[
                styles.roleBadgeText,
                active ? styles.roleBadgeTextActive : styles.roleBadgeTextIdle,
              ]}
            >
              {active ? "Selected" : "Choose"}
            </Text>
          </View>
        </View>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export const AuthIcons = {
  email: (color = authColors.faint) => <Feather name="mail" size={18} color={color} />,
  lock: (color = authColors.faint) => <Feather name="lock" size={18} color={color} />,
  unlock: (color = authColors.orange) => <Feather name="unlock" size={18} color={color} />,
  user: (color = authColors.faint) => <Feather name="user" size={18} color={color} />,
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: authColors.overlay,
  },
  safeArea: {
    flex: 1,
  },
  plainSafeArea: {
    flex: 1,
    backgroundColor: authColors.page,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  plainScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingTop: 18,
    paddingBottom: 28,
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  brand: {
    color: authColors.white,
    fontSize: 24,
    fontWeight: "400",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: authColors.white,
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 34,
    paddingBottom: 30,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 20,
  },
  titleWrap: {
    marginBottom: 24,
  },
  title: {
    color: authColors.ink,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: authColors.ink,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  fieldLabelLight: {
    color: authColors.white,
    marginLeft: 5,
    fontSize: 13,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 12,
    minHeight: 55,
    paddingHorizontal: 15,
    backgroundColor: authColors.white,
  },
  inputShellMultiline: {
    alignItems: "flex-start",
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: authColors.text,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 90,
  },
  rightAction: {
    paddingLeft: 10,
  },
  primaryButton: {
    backgroundColor: authColors.orange,
    borderRadius: 14,
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: authColors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonNavy: {
    backgroundColor: authColors.navy,
    shadowColor: authColors.navy,
  },
  primaryButtonText: {
    color: authColors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  secondaryButton: {
    backgroundColor: authColors.soft,
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  secondaryButtonNavy: {
    backgroundColor: authColors.navy,
  },
  secondaryButtonText: {
    color: authColors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryButtonTextOnNavy: {
    color: authColors.white,
  },
  errorText: {
    color: "#b63b3b",
    marginBottom: 12,
    lineHeight: 20,
  },
  helperText: {
    color: authColors.faint,
    fontSize: 12,
    textAlign: "left",
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerPrompt: {
    color: authColors.muted,
    fontSize: 13,
  },
  footerPromptLight: {
    color: authColors.white,
  },
  footerAction: {
    color: authColors.orange,
    fontSize: 13,
    fontWeight: "bold",
  },
  topHeader: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 14,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 5,
    zIndex: 10,
  },
  topBrand: {
    color: authColors.orange,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  topTitle: {
    color: authColors.ink,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 6,
  },
  topSubtitle: {
    color: authColors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  roleCard: {
    minHeight: 132,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  roleCardActive: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  roleCardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  roleCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  roleBadge: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleBadgeIdle: {
    borderColor: "#d8dee7",
    backgroundColor: "#f8fafc",
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  roleBadgeTextActive: {
    color: authColors.white,
  },
  roleBadgeTextIdle: {
    color: authColors.muted,
  },
  roleTitle: {
    color: authColors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  roleSubtitle: {
    color: "#516173",
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: authColors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  formCardTitle: {
    color: authColors.ink,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  formCardSubtitle: {
    color: "#667085",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
});
