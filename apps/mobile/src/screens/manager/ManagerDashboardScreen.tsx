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
  const [isLoading, setIsLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedPlateName, setSelectedPlateName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!token) {
          return;
        }

        setIsLoading(true);
        try {
          const [dashboardResponse, reviewsResponse] = await Promise.all([
            getManagerDashboard(token),
            getManagerReviews(token),
          ]);
          setData(dashboardResponse);
          setAllReviews(reviewsResponse.items);
        } finally {
          setIsLoading(false);
        }
      };

      void load();
    }, [token])
  );

  const filteredReviews = useMemo(() => {
    let next = [...allReviews];

    if (reviewFilter === "restaurant") {
      next = next.filter((review) => review.targetType === "restaurant");
    }

    if (reviewFilter === "plate") {
      next = next.filter((review) => review.targetType === "plate");
    }

    if (selectedPlateName) {
      next = next.filter((review) => review.plate?.name === selectedPlateName);
    }

    if (sortMode === "highest") {
      next.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === "lowest") {
      next.sort((a, b) => a.rating - b.rating);
    } else {
      next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }

    return next;
  }, [allReviews, reviewFilter, selectedPlateName, sortMode]);

  if (isLoading) {
    return <ManagerLoading label="Loading dashboard..." />;
  }

  return (
    <ManagerScreen scroll>
      <ManagerHeader
        title="Customer feedback"
        subtitle="See what guests are saying."
      />

      <ManagerCard accent>
        <Text style={styles.heroEyebrow}>Overview</Text>
        <Text style={styles.heroTitle}>{data?.restaurant?.name || "No restaurant yet"}</Text>
        <View style={styles.metricsRow}>
          <ManagerMetric label="Average rating" value={data?.averageRating?.toFixed(1) || "0.0"} />
          <ManagerMetric label="Plates" value={String(data?.plates.length || 0)} />
          <ManagerMetric label="Reviews" value={String(allReviews.length)} />
        </View>
        <ManagerButton
          label="Restaurant reviews"
          variant="secondary"
          onPress={() => {
            setReviewFilter("restaurant");
            setSelectedPlateName(null);
          }}
        />
      </ManagerCard>

      <ManagerSectionTitle
        title="Review filters"
        subtitle={selectedPlateName ? selectedPlateName : "Choose which reviews to see."}
      />
      <FilterRow>
        <ManagerChip active={sortMode === "newest"} label="Newest" onPress={() => setSortMode("newest")} />
        <ManagerChip active={sortMode === "highest"} label="Highest" onPress={() => setSortMode("highest")} />
        <ManagerChip active={sortMode === "lowest"} label="Lowest" onPress={() => setSortMode("lowest")} />
      </FilterRow>
      <FilterRow>
        <ManagerChip
          active={reviewFilter === "all"}
          label="All reviews"
          onPress={() => {
            setReviewFilter("all");
            setSelectedPlateName(null);
          }}
        />
        <ManagerChip
          active={reviewFilter === "restaurant"}
          label="Restaurant"
          onPress={() => {
            setReviewFilter("restaurant");
            setSelectedPlateName(null);
          }}
        />
        <ManagerChip active={reviewFilter === "plate"} label="Plate" onPress={() => setReviewFilter("plate")} />
