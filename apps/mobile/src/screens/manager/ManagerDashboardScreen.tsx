import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, EmptyState, MediaPreview } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";
import { getManagerDashboard, getManagerReviews } from "../../services/appApi";
import { ManagerDashboard, Review } from "../../types/api";
import {
  ManagerButton,
  ManagerCard,
  ManagerChip,
  ManagerHeader,
  ManagerInfoText,
  ManagerLoading,
  ManagerMetric,
  ManagerScreen,
  ManagerSectionTitle,
  managerColors,
} from "./ManagerUi";

type ReviewFilter = "all" | "restaurant" | "plate";
type SortMode = "newest" | "highest" | "lowest";

export function ManagerDashboardScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<ManagerDashboard | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
