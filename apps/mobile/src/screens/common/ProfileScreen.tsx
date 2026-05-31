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
