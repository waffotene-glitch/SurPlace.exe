import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { EmptyState, LoadingState, MediaPreview } from "../../components/AppUi";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { getPlateDetails } from "../../services/appApi";
import { PlateDetailsResponse } from "../../types/api";

export function PlateDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { plateId } = route.params;
  const { refreshToken } = useReviewRefresh();
  const [data, setData] = useState<PlateDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setIsLoading(true);
        try {
          const response = await getPlateDetails(plateId);

          if (isActive) {
            setData(response);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void load();

      return () => {
        isActive = false;
      };
    }, [plateId])
  );

  useEffect(() => {
    if (refreshToken === 0) {
      return;
    }

    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await getPlateDetails(plateId);

        if (isActive) {
          setData(response);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [plateId, refreshToken]);

  if (isLoading || !data) {
    return <LoadingState label="Loading plate..." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        {data.plate.imageUrl ? (
          <Image source={{ uri: data.plate.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]} />
        )}
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Plate</Text>
          </View>
          <Text style={styles.heroTitle}>{data.plate.name}</Text>
          <Text style={styles.heroSubtitle}>{data.restaurant.name}</Text>
          <Text style={styles.heroDescription}>{data.plate.description}</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data.plate.averageRating.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Average rating</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data.plate.totalReviews}</Text>
              <Text style={styles.metricLabel}>Reviews</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {data.plate.price ? `${data.plate.price}` : "--"}
              </Text>
              <Text style={styles.metricLabel}>Price XAF</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Served at</Text>
        <Text style={styles.infoHeadline}>{data.restaurant.name}</Text>
        <Text style={styles.infoBody}>{data.restaurant.address}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate("RestaurantDetails", {
              restaurantId: data.restaurant.id,
              restaurantName: data.restaurant.name,
            })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Open restaurant</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate("ReviewCreate", {
            restaurantId: data.restaurant.id,
            restaurantName: data.restaurant.name,
            plateId: data.plate.id,
            plateName: data.plate.name,
          })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Write a plate review</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent reviews</Text>
        <Text style={styles.sectionSubtitle}>Live review data from verified submissions</Text>
      </View>

      <View style={styles.reviewColumn}>
        {data.reviews.map((review) => (
          (() => {
            const media = review.media[0];
            const mediaUri = media?.url || media?.secureUrl || media?.mediaUrl;
            const mediaType = media?.type || media?.mediaType || media?.resourceType;

            return (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.reviewAuthor}>{review.user?.fullName || "Community user"}</Text>
                <Text style={styles.reviewMeta}>
                  {review.rating}/5 · {review.likesCount} likes
                </Text>
              </View>
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>
                  {review.targetType === "plate" ? "Plate review" : "Restaurant review"}
                </Text>
              </View>
            </View>
            <MediaPreview
              uri={mediaUri}
              mediaType={mediaType}
              height={250}
              fallbackText="Review media is unavailable for this plate review."
            />
            <Text style={styles.reviewBody}>{review.comment || "No comment added."}</Text>
          </View>
            );
          })()
        ))}
        {!data.reviews.length ? (
          <EmptyState
            title="No reviews yet"
            body="Be the first person to review this plate."
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff8f3",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#171717",
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#e5e7eb",
  },
  heroFallback: {
    backgroundColor: "#ececec",
  },
  heroContent: {
    padding: 18,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f26b3a",
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#f6a27d",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  heroDescription: {
    color: "#e5e7eb",
    lineHeight: 20,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#242424",
    padding: 12,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  metricLabel: {
    color: "#d4d4d8",
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  infoTitle: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoHeadline: {
    color: "#18181b",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoBody: {
    color: "#4b5563",
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: "#f26b3a",
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff1e8",
  },
  secondaryButtonText: {
    color: "#d04d20",
    fontWeight: "800",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#18181b",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 13,
  },
  reviewColumn: {
    gap: 14,
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 14,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  reviewAuthor: {
    color: "#18181b",
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 4,
  },
  reviewMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  reviewBadge: {
    backgroundColor: "#fff1e8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewBadgeText: {
    color: "#d04d20",
    fontSize: 11,
    fontWeight: "800",
  },
  reviewBody: {
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
  },
});
