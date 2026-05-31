import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Meta, Screen, Title } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initials = useMemo(() => {
    return (
      user?.fullName
        ?.split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U"
    );
  }, [user?.fullName]);

  return (
    <Screen scroll>
      <Title subtitle="Your account details and access stay exactly the same.">Profile</Title>
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{user?.role === "manager" ? "Manager" : "Foodie"}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.role === "manager" ? "Pro" : "User"}</Text>
          <Text style={styles.statLabel}>Account type</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.managedRestaurant ? "Yes" : "No"}</Text>
          <Text style={styles.statLabel}>Restaurant linked</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <Meta>Email: {user?.email}</Meta>
        <Meta>Role: {user?.role}</Meta>
        <Meta>
          Restaurant access: {user?.managedRestaurant ? "Linked to a managed restaurant" : "No linked restaurant"}
        </Meta>
      </Card>

      <Button label="Logout" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "#171717",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#f26b3a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  email: {
    color: "#d4d4d8",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: "#2b2b2b",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roleBadgeText: {
    color: "#f6a27d",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ece7de",
    padding: 16,
  },
  statValue: {
    color: "#18181b",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
});
