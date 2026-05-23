import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Button, Card, CardTitle, LoadingState, MediaPreview, Meta, Screen, Title } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { getFeed, likeReview } from "../../services/appApi";
import { Review } from "../../types/api";

export function FeedScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const { refreshToken } = useReviewRefresh();
  const [items, setItems] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const response = await getFeed();
      setItems(response.items);
    } finally {
      setIsLoading(false);
    }
  };
useFocusEffect(
    useCallback(() => {
      void load();
    }, [])
  );

  useEffect(() => {
    if (refreshToken > 0) {
      void load();
    }
  }, [refreshToken]);

  if (isLoading) {
    return <LoadingState label="Loading verified feed..." />;
  }
   return (
    <Screen scroll>
      <Title subtitle="Verified community posts with media, like action, and direct navigation.">
        Food Feed
      </Title>
      {items.map((item) => (
        <Card key={item._id}>
          <Badge
            label={item.targetType === "plate" ? "Plate Review" : "Restaurant Review"}
            tone={item.targetType === "plate" ? "warning" : "neutral"}
          />
          <CardTitle>{item.restaurant?.name || "Restaurant"}</CardTitle>
          {item.plate?.name ? <Meta>Plate: {item.plate.name}</Meta> : null}
          <Meta>
            {item.user?.fullName} - Rating {item.rating}/5 - {item.likesCount} likes
          </Meta>
          <MediaPreview
            uri={item.media[0]?.url}
            mediaType={item.media[0]?.type}
            height={260}
            fallbackText="Review media is unavailable for this feed item."
          />
                    <Text style={{ marginTop: 10 }}>{item.comment || "No comment added."}</Text>
          <Button
            label="View details"
            variant="secondary"
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