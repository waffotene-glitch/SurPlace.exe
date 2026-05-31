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
