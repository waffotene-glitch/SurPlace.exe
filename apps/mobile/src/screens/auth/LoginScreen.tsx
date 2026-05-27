import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { useAuth } from "../../context/AuthContext";
import {
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthIcons,
  AuthPrimaryButton,
  AuthHelper,
  AuthScaffold,
  AuthSecondaryButton,
  AuthTitle,
} from "./AuthUi";
import { validateEmail, validatePassword } from "./authValidation";

export function LoginScreen({
  navigation,
}: {
  navigation: any;
}) {
  const { signIn } = useAuth();
  const { isLoading, error, run, setError } = useAsyncTask();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthScaffold backgroundUri="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop">
      <AuthTitle
        title="Welcome to SurPlace"
        subtitle="Sign in to explore trusted food reviews."
      />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="your.email@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        icon={AuthIcons.email()}
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        icon={showPassword ? AuthIcons.unlock() : AuthIcons.lock()}
        rightIcon={showPassword ? AuthIcons.unlock() : AuthIcons.lock()}
        onRightIconPress={() => setShowPassword((current) => !current)}
      />

      <AuthError message={error} />
      <AuthHelper>Use the account credentials you created during sign up.</AuthHelper>
      <AuthPrimaryButton
        label={isLoading ? "Signing in..." : "Log In"}
        disabled={isLoading}
        onPress={() => {
          const emailError = validateEmail(email);
          if (emailError) {
            setError(emailError);
            return;
          }

          const passwordError = validatePassword(password);
          if (passwordError) {
            setError(passwordError);
            return;
          }

          void run(async () => {
            await signIn({ email: email.trim().toLowerCase(), password });
          });
        }}
      />

      <Text style={styles.demoLabel}>Try a demo account</Text>
      <View style={styles.demoRow}>
        <View style={styles.demoButtonWrap}>
          <AuthSecondaryButton
            label="Use demo user"
            onPress={() => {
              setEmail("alice@verifiedfood.demo");
              setPassword("Password123!");
            }}
          />
        </View>
        <View style={styles.demoButtonWrap}>
          <AuthSecondaryButton
            label="Use demo manager"
            tone="navy"
            onPress={() => {
              setEmail("manager@verifiedfood.demo");
              setPassword("Password123!");
            }}
          />
        </View>
      </View>

      <AuthFooterLink
        prompt="Need an account?"
        action="Create account"
        onPress={() => navigation.navigate("Register")}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  demoLabel: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  demoButtonWrap: {
    flex: 1,
  },
});
