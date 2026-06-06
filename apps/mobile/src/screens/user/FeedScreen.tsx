import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { EmptyState, LoadingState, MediaPreview } from "../../components/AppUi";
import { getFeed, likeReview } from "../../services/appApi";
import { Review } from "../../types/api";

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

function getInitials(name?: string) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function FeedScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const { refreshToken } = useReviewRefresh();
  const [items, setItems] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedReviewIds, setLikedReviewIds] = useState<string[]>([]);
  const [pendingLikeIds, setPendingLikeIds] = useState<string[]>([]);

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await getFeed(token);
      setItems(response.items);
      setLikedReviewIds(
        response.items
          .filter((item) => item.likedByCurrentUser)
          .map((item) => item._id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [token])
  );

  useEffect(() => {
    if (refreshToken > 0) {
      void load();
    }
  }, [refreshToken]);

  const featuredCount = useMemo(
    () => items.filter((item) => item.media[0]?.type === "video").length,
    [items]
  );

  if (isLoading) {
    return <LoadingState label="Loading community feed..." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerEyebrow}>Community feed</Text>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <Text style={styles.headerSubtitle}>Real reviews from nearby food lovers.</Text>
        <View style={styles.headerPills}>
          <View style={[styles.headerPill, styles.headerPillActive]}>
            <Text style={[styles.headerPillText, styles.headerPillTextActive]}>For you</Text>
          </View>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              {featuredCount > 0 ? `${featuredCount} video${featuredCount === 1 ? "" : "s"}` : "Latest reviews"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.feedColumn}>
        {!items.length ? (
          <EmptyState
            title="No reviews in the feed yet"
            body="Check back soon for new posts from the community."
          />
        ) : null}
        {items.map((item) => {
          const media = item.media[0];
          const mediaUri = media?.url || media?.secureUrl || media?.mediaUrl;
          const mediaType = media?.type || media?.mediaType || media?.resourceType;
          const restaurantName = item.restaurant?.name || "Restaurant";
          const plateName = item.plate?.name;
          return (
            <View key={item._id} style={styles.feedCard}>
              <View style={styles.feedTopRow}>
                <View style={styles.authorRow}>
                  {item.user?.avatarUrl ? (
                    <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>
                        {getInitials(item.user?.fullName)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.authorMeta}>
                    <Text style={styles.authorName}>{item.user?.fullName || "Community user"}</Text>
                    <Text style={styles.authorSubline}>{`${formatRelativeDate(item.createdAt)} · ${restaurantName}`}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    item.targetType === "plate" ? styles.typeBadgeWarm : styles.typeBadgeCool,
                  ]}
                >
                  <Text style={styles.typeBadgeText}>
                    {item.targetType === "plate" ? "Plate review" : "Restaurant review"}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewHeadlineRow}>
                <Text style={styles.restaurantTitle}>{restaurantName}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>{item.rating}/5</Text>
                </View>
              </View>

              {plateName ? <Text style={styles.plateTitle}>{plateName}</Text> : null}

              <MediaPreview
                uri={mediaUri}
                mediaType={mediaType}
                height={340}
                fallbackText="Review media is unavailable for this feed item."
              />

              <Text style={styles.commentText}>{item.comment || "No comment added."}</Text>

              <View style={styles.metricsRow}>
                <Text style={styles.metricText}>
                  {item.verification.isVerifiedOnSite ? "Trusted visit" : "Pending review"}
                </Text>
              </View>

              <View style={styles.primaryActionRow}>
                {token ? (
                  <Pressable
                    onPress={() => {
                      if (pendingLikeIds.includes(item._id)) {
                        return;
                      }

                      const wasLiked = likedReviewIds.includes(item._id);
                      setPendingLikeIds((current) => [...current, item._id]);
                      setLikedReviewIds((current) =>
                        wasLiked
                          ? current.filter((reviewId) => reviewId !== item._id)
                          : [...current, item._id]
                      );
                      setItems((current) =>
                        current.map((review) =>
                          review._id === item._id
                            ? {
                                ...review,
                                likesCount: Math.max(0, review.likesCount + (wasLiked ? -1 : 1)),
                              }
                            : review
                        )
                      );
                      void likeReview(token, item._id)
                        .then((response) => {
                          setItems((current) =>
                            current.map((review) =>
                              review._id === item._id
                                ? { ...review, likesCount: response.likesCount }
                                : review
                            )
                          );
                          setLikedReviewIds((current) =>
                            response.liked
                              ? current.includes(item._id)
                                ? current
                                : [...current, item._id]
                              : current.filter((reviewId) => reviewId !== item._id)
                          );
                        })
                        .catch(() => {
                          setLikedReviewIds((current) =>
                            wasLiked
                              ? current.includes(item._id)
                                ? current
                                : [...current, item._id]
                              : current.filter((reviewId) => reviewId !== item._id)
                          );
                          setItems((current) =>
                            current.map((review) =>
                              review._id === item._id
                                ? {
                                    ...review,
                                    likesCount: Math.max(0, review.likesCount + (wasLiked ? 1 : -1)),
                                  }
                                : review
                            )
                          );
                        })
                        .finally(() => {
                          setPendingLikeIds((current) =>
                            current.filter((reviewId) => reviewId !== item._id)
                          );
                        });
                    }}
                    style={[
                      styles.likeButton,
                      likedReviewIds.includes(item._id) ? styles.likeButtonActive : null,
                    ]}
                  >
                    <Ionicons
                      name={likedReviewIds.includes(item._id) ? "heart" : "heart-outline"}
                      size={18}
                      color={likedReviewIds.includes(item._id) ? "#ffffff" : "#f6a27d"}
                    />
                    <View style={styles.likeTextWrap}>
                      <Text
                        style={[
                          styles.likeCountText,
                          likedReviewIds.includes(item._id) ? styles.likeCountTextActive : null,
                        ]}
                      >
                        {item.likesCount}
                      </Text>
                      <Text
                        style={[
                          styles.likeLabelText,
                          likedReviewIds.includes(item._id) ? styles.likeLabelTextActive : null,
                        ]}
                      >
                        Likes
                      </Text>
                    </View>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => {
                    if (item.targetType === "plate" && item.plate && item.restaurant) {
                      navigation.navigate("PlateDetails", {
                        plateId: item.plate._id,
                        plateName: item.plate.name,
                        restaurantId: item.restaurant._id,
                        restaurantName: item.restaurant.name,
                      });
                      return;
                    }

                    if (item.restaurant) {
                      navigation.navigate("RestaurantDetails", {
                        restaurantId: item.restaurant._id,
                        restaurantName: item.restaurant.name,
                      });
                    }
                  }}
                  style={[styles.actionButton, styles.actionButtonDark, styles.detailsButton]}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={18} color="#ffffff" />
                  <Text style={styles.actionButtonDarkText}>View details</Text>
                </Pressable>
              </View>

              <View style={styles.secondaryActionRow}>
                {item.restaurant ? (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("RestaurantDetails", {
                        restaurantId: item.restaurant!._id,
                        restaurantName: item.restaurant!.name,
                      })
                    }
                    style={[styles.linkChip, styles.linkChipWarm]}
                  >
                    <Ionicons name="storefront-outline" size={15} color="#f6a27d" />
                    <Text style={styles.linkChipText}>Restaurant</Text>
                  </Pressable>
                ) : null}
                {item.targetType === "plate" && item.plate && item.restaurant ? (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("PlateDetails", {
                        plateId: item.plate!._id,
                        plateName: item.plate!.name,
                        restaurantId: item.restaurant!._id,
                        restaurantName: item.restaurant!.name,
                      })
                    }
                    style={[styles.linkChip, styles.linkChipCool]}
                  >
                    <Ionicons name="restaurant-outline" size={15} color="#9cd7cf" />
                    <Text style={styles.linkChipText}>Plate</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111111",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  headerCard: {
    backgroundColor: "#1b1b1b",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  headerEyebrow: {
    color: "#f6a27d",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#d4d4d8",
    lineHeight: 20,
    marginBottom: 16,
  },
  headerPills: {
    flexDirection: "row",
    gap: 10,
  },
  headerPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#242424",
  },
  headerPillActive: {
    backgroundColor: "#f26b3a",
  },
  headerPillText: {
    color: "#d4d4d8",
    fontWeight: "700",
  },
  headerPillTextActive: {
    color: "#ffffff",
  },
  feedColumn: {
    gap: 16,
  },
  feedCard: {
    backgroundColor: "#1b1b1b",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  feedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f26b3a",
  },
  avatarFallbackText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  authorSubline: {
    color: "#a1a1aa",
    fontSize: 12,
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeWarm: {
    backgroundColor: "#3d2a20",
  },
  typeBadgeCool: {
    backgroundColor: "#212f33",
  },
  typeBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  reviewHeadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  restaurantTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginRight: 12,
  },
  ratingBadge: {
    backgroundColor: "#f26b3a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingBadgeText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
  },
  plateTitle: {
    color: "#f6a27d",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  commentText: {
    color: "#f5f5f5",
    lineHeight: 21,
    marginTop: 14,
    marginBottom: 12,
  },
  metricsRow: {
    marginBottom: 14,
  },
  metricText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "600",
  },
  primaryActionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "stretch",
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonDark: {
    backgroundColor: "#f26b3a",
  },
  detailsButton: {
    flex: 1,
  },
  actionButtonDarkText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  likeButton: {
    minWidth: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3b3030",
    backgroundColor: "#231b1c",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  likeButtonActive: {
    backgroundColor: "#f26b3a",
    borderColor: "#f26b3a",
  },
  likeTextWrap: {
    alignItems: "flex-start",
  },
  likeCountText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 16,
  },
  likeCountTextActive: {
    color: "#ffffff",
  },
  likeLabelText: {
    color: "#f6a27d",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  likeLabelTextActive: {
    color: "#ffffff",
  },
  secondaryActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  linkChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  linkChipWarm: {
    backgroundColor: "#2a2220",
    borderColor: "#433029",
  },
  linkChipCool: {
    backgroundColor: "#1e2a2a",
    borderColor: "#2e4242",
  },
  linkChipText: {
    color: "#f6a27d",
    fontWeight: "700",
    fontSize: 12,
  },
});
