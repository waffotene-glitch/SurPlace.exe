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
      </FilterRow>

      <ManagerSectionTitle
        title="Review results"
        subtitle={`${filteredReviews.length} result${filteredReviews.length === 1 ? "" : "s"}`}
      />
      {filteredReviews.length ? (
        filteredReviews.map((review) => (
          <ManagerCard key={review._id}>
            <View style={styles.rowBetween}>
              <Badge
                label={review.targetType === "plate" ? "Plate Review" : "Restaurant Review"}
                tone={review.targetType === "plate" ? "warning" : "neutral"}
              />
              <ManagerChip
                label={review.verification.isVerifiedOnSite ? "Trusted visit" : "Needs attention"}
                active
                tone={review.verification.isVerifiedOnSite ? "success" : "danger"}
              />
            </View>
            {review.targetType === "plate" && review.plate?.name ? (
              <ManagerInfoText>Plate: {review.plate.name}</ManagerInfoText>
            ) : null}
            <Text style={styles.reviewAuthor}>
              {`${review.user?.fullName || "Anonymous reviewer"} · ${review.rating}/5`}
            </Text>
            <ManagerInfoText tone="muted">
              {`${new Date(review.createdAt).toLocaleDateString()} · ${review.likesCount} likes`}
            </ManagerInfoText>
            <Text style={styles.reviewBody}>{review.comment || "No comment added."}</Text>
            {review.media[0] ? (
              <MediaPreview
                uri={review.media[0].thumbnailUrl || review.media[0].url}
                mediaType={review.media[0].type}
                height={180}
                fallbackText="Review media could not be loaded."
              />
            ) : null}
          </ManagerCard>
        ))
      ) : (
        <EmptyState
          title="No reviews match this filter"
          body="Try another filter or clear the selected plate."
        />
      )}
    </ManagerScreen>
  );
}

function FilterRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.filterRow}>{children}</View>;
}

const styles = StyleSheet.create({
  heroEyebrow: {
    color: managerColors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: managerColors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    color: managerColors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
  },
  reviewBody: {
    color: "#e0e5f2",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
});
