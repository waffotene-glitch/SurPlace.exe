import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { EmptyState, LoadingState, MediaPreview } from "../../components/AppUi";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { getRestaurantDetails } from "../../services/appApi";
import { RestaurantDetailsResponse } from "../../types/api";

export function RestaurantDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { restaurantId } = route.params;
  const { refreshToken } = useReviewRefresh();
  const [data, setData] = useState<RestaurantDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setIsLoading(true);
        try {
          const response = await getRestaurantDetails(restaurantId);

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
    }, [restaurantId])
  );

  useEffect(() => {
    if (refreshToken === 0) {
      return;
    }

    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await getRestaurantDetails(restaurantId);

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
  }, [restaurantId, refreshToken]);

  if (isLoading || !data) {
    return <LoadingState label="Loading restaurant..." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroShell}>
        {data.restaurant.coverImageUrl ? (
          <Image source={{ uri: data.restaurant.coverImageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]} />
        )}
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Restaurant</Text>
          </View>
          <Text style={styles.heroTitle}>{data.restaurant.name}</Text>
          <Text style={styles.heroAddress}>{data.restaurant.location.address}</Text>
          <Text style={styles.heroDescription}>{data.restaurant.description}</Text>
          <View style={styles.heroMetricsRow}>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{data.restaurant.averageRating.toFixed(1)}</Text>
              <Text style={styles.heroMetricLabel}>Average rating</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{data.restaurant.totalReviews}</Text>
              <Text style={styles.heroMetricLabel}>Reviews</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{data.plates.length}</Text>
              <Text style={styles.heroMetricLabel}>Plates</Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate("ReviewCreate", {
            restaurantId: data.restaurant.id,
            restaurantName: data.restaurant.name,
          })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Write a restaurant review</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available plates</Text>
        <Text style={styles.sectionSubtitle}>Open a plate to see individual review history</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.plateRow}
      >
        {data.plates.map((plate) => (
          <Pressable
            key={plate.id}
            onPress={() =>
              navigation.navigate("PlateDetails", {
                plateId: plate.id,
                plateName: plate.name,
                restaurantId: data.restaurant.id,
                restaurantName: data.restaurant.name,
              })
            }
            style={styles.plateCard}
          >
            {plate.imageUrl ? (
              <Image source={{ uri: plate.imageUrl }} style={styles.plateImage} />
            ) : (
              <View style={[styles.plateImage, styles.heroFallback]} />
            )}
            <Text numberOfLines={1} style={styles.plateName}>
              {plate.name}
            </Text>
            <Text style={styles.plateMeta}>
              {plate.averageRating.toFixed(1)} / 5 · {plate.totalReviews} reviews
            </Text>
            <Text numberOfLines={2} style={styles.plateDescription}>
              {plate.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent reviews</Text>
        <Text style={styles.sectionSubtitle}>Verified community activity for this restaurant</Text>
      </View>

      <View style={styles.reviewColumn}>
        {data.recentReviews.map((review) => (
          (() => {
            const media = review.media[0];
            const mediaUri = media?.url || media?.secureUrl || media?.mediaUrl;
            const mediaType = media?.type || media?.mediaType || media?.resourceType;

            return (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewTopRow}>
              <View>
                <Text style={styles.reviewHeadline}>
                  {review.plate?.name || data.restaurant.name}
                </Text>
                <Text style={styles.reviewMeta}>
                  {review.user?.fullName || "Community user"} · {review.rating}/5 · {review.likesCount} likes
                </Text>
              </View>
              <View
                style={[
                  styles.reviewTag,
                  review.targetType === "plate" ? styles.reviewTagWarm : styles.reviewTagCool,
                ]}
              >
                <Text style={styles.reviewTagText}>
                  {review.targetType === "plate" ? "Plate" : "Restaurant"}
                </Text>
              </View>
            </View>
            <MediaPreview
              uri={mediaUri}
              mediaType={mediaType}
              height={250}
              fallbackText="Review media is unavailable for this restaurant review."
            />
            <Text style={styles.reviewBody}>{review.comment || "No comment added."}</Text>
          </View>
            );
          })()
        ))}
        {!data.recentReviews.length ? (
          <EmptyState
            title="No reviews yet"
            body="Be the first person to add a verified review here."
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
    paddingBottom: 28,
  },
  heroShell: {
    position: "relative",
    minHeight: 360,
    marginBottom: 18,
  },
  heroImage: {
    width: "100%",
    height: 360,
    backgroundColor: "#e5e7eb",
  },
  heroFallback: {
    backgroundColor: "#ececec",
  },
  heroOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(16,16,16,0.72)",
    borderRadius: 24,
    padding: 18,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#f26b3a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroAddress: {
    color: "#f3f4f6",
    marginBottom: 10,
  },
  heroDescription: {
    color: "#f3f4f6",
    lineHeight: 20,
    marginBottom: 16,
  },
  heroMetricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
  },
  heroMetricValue: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 4,
  },
  heroMetricLabel: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  primaryButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#f26b3a",
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
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
  plateRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  plateCard: {
    width: 240,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    marginRight: 14,
  },
  plateImage: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
  },
  plateName: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  plateMeta: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 6,
  },
  plateDescription: {
    color: "#4b5563",
    lineHeight: 18,
  },
  reviewColumn: {
    paddingHorizontal: 16,
    gap: 14,
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 14,
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  reviewHeadline: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  reviewMeta: {
    color: "#6b7280",
    fontSize: 12,
  },
  reviewTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  reviewTagWarm: {
    backgroundColor: "#fff1e8",
  },
  reviewTagCool: {
    backgroundColor: "#e8f4f2",
  },
  reviewTagText: {
    color: "#1f2937",
    fontSize: 11,
    fontWeight: "800",
  },
  reviewBody: {
    color: "#374151",
    lineHeight: 20,
    marginTop: 12,
  },
});
