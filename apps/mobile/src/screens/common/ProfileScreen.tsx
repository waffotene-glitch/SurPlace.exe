import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Meta, Screen, Title } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initials = useMemo(() => {
    return (
      user?.fullName
