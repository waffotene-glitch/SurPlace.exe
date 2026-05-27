import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/api";
import {
  AuthError,
  AuthField,
  AuthFormCard,
  AuthFooterLink,
  AuthHelper,
  AuthIcons,
  AuthPrimaryButton,
  AuthPlainScaffold,
  AuthRoleCard,
  AuthTopHeader,
} from "./AuthUi";
import { validateEmail, validateFullName, validatePassword } from "./authValidation";

export function RegisterScreen({ navigation }: { navigation: any }) {
  const { signUp } = useAuth();
  const { isLoading, error, run, setError } = useAsyncTask();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"role" | "form">("role");

  return (
    <AuthPlainScaffold>
      <AuthTopHeader
        title="Create your SurPlace account"
        subtitle={
          step === "role"
            ? "Choose your account type."
            : role === "manager"
              ? "Set up your restaurant manager account."
              : "Set up your discovery and review account."
        }
        onBack={() => {
          if (step === "form") {
            setStep("role");
            return;
          }

          navigation.navigate("Login");
        }}
      />

      {step === "role" ? (
        <>
          <View style={styles.roleSectionHeader}>
            <Text style={styles.roleEyebrow}>Step 1 of 2</Text>
            <Text style={styles.roleTitle}>Choose your account type</Text>
            <Text style={styles.roleSubtitle}>
              Pick the experience that matches how you want to use SurPlace.
            </Text>
          </View>
          <AuthRoleCard
            title="Discover & Review"
            subtitle="For diners who want to explore restaurants, rate dishes, and share trusted visits."
            type="user"
            active={role === "user"}
            onPress={() => setRole("user")}
          />
          <AuthRoleCard
            title="Manage Restaurant"
            subtitle="For restaurant managers who want to update menus and track guest feedback."
            type="manager"
            active={role === "manager"}
            onPress={() => setRole("manager")}
          />

          <AuthPrimaryButton
            label="Continue"
            tone={role === "manager" ? "navy" : "orange"}
            onPress={() => setStep("form")}
          />

          <View style={{ marginTop: 6 }}>
            <AuthFooterLink
              prompt="Already have an account?"
              action="Log In"
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </>
      ) : (
          <AuthFormCard
          title={role === "manager" ? "Create your manager account" : "Create your user account"}
          subtitle={role === "manager" ? "Step 2 of 2. Add your details to manage your restaurant." : "Step 2 of 2. Add your details to start discovering and reviewing."}
        >
          <View style={styles.selectedRoleBanner}>
            <Text style={styles.selectedRoleEyebrow}>Selected account type</Text>
            <Text style={styles.selectedRoleValue}>
              {role === "manager" ? "Manage Restaurant" : "Discover & Review"}
            </Text>
          </View>
          <AuthField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder={role === "manager" ? "Jane Manager" : "Alex Reviewer"}
            icon={AuthIcons.user()}
          />
          <AuthField
            label={role === "manager" ? "Business Email" : "Email Address"}
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
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            icon={showPassword ? AuthIcons.unlock("#1C3B8B") : AuthIcons.lock()}
            rightIcon={showPassword ? AuthIcons.unlock("#1C3B8B") : AuthIcons.lock()}
            onRightIconPress={() => setShowPassword((current) => !current)}
          />
          <AuthHelper>Password must be at least 4 characters and include at least one letter and one number.</AuthHelper>

          <AuthError message={error} />
          <AuthPrimaryButton
            label={
              isLoading
                ? "Creating..."
                : role === "manager"
                  ? "Create manager account"
                  : "Create account"
            }
            tone={role === "manager" ? "navy" : "orange"}
            disabled={isLoading}
            onPress={() => {
              const fullNameError = validateFullName(fullName);
              if (fullNameError) {
                setError(fullNameError);
                return;
              }

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
                await signUp({
                  fullName: fullName.trim(),
                  email: email.trim().toLowerCase(),
                  password,
                  role,
                });
              });
            }}
          />

          <View style={{ marginTop: 6 }}>
            <AuthFooterLink
              prompt="Already have an account?"
              action="Log In"
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </AuthFormCard>
      )}
    </AuthPlainScaffold>
  );
}

const styles = StyleSheet.create({
  roleSectionHeader: {
    marginBottom: 20,
  },
  roleEyebrow: {
    color: "#ff6b00",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  roleTitle: {
    color: "#001e36",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  roleSubtitle: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
  },
  selectedRoleBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 18,
  },
  selectedRoleEyebrow: {
    color: "#667085",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  selectedRoleValue: {
    color: "#001e36",
    fontSize: 16,
    fontWeight: "800",
  },
});
