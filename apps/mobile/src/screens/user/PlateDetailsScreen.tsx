import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Card, CardTitle, LoadingState, MediaPreview, Meta, Screen, Title } from "../../components/AppUi";
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
    <Screen scroll>
      <Title subtitle={data.restaurant.name}>{data.plate.name}</Title>
      <Card>
        {data.plate.imageUrl ? (
          <Image
            source={{ uri: data.plate.imageUrl }}
            style={{ width: "100%", height: 180, borderRadius: 16, marginBottom: 12 }}
          />
        ) : null}
        <CardTitle>Plate details</CardTitle>
        <Meta>
          Rating {data.plate.averageRating.toFixed(1)} - {data.plate.totalReviews} reviews
        </Meta>
        <Meta>Price: {data.plate.price ? `${data.plate.price} XAF` : "Not set"}</Meta>
        <Meta>Restaurant: {data.restaurant.name}</Meta>
        <Meta>Address: {data.restaurant.address}</Meta>
        <Text style={{ marginTop: 8 }}>{data.plate.description}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate("ReviewCreate", {
              restaurantId: data.restaurant.id,
              restaurantName: data.restaurant.name,
              plateId: data.plate.id,
              plateName: data.plate.name,
            })
          }
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: "#1f6f5f", fontWeight: "700" }}>Review this plate</Text>
        </Pressable>
      </Card>
      <Text style={{ marginVertical: 10, fontWeight: "700", fontSize: 18 }}>Reviews</Text>
      {data.reviews.map((review) => (
        <Card key={review._id}>
          <Badge
            label={review.targetType === "plate" ? "Plate Review" : "Restaurant Review"}
            tone={review.targetType === "plate" ? "warning" : "neutral"}
          />
          <Meta>
            {review.user?.fullName} - Rating {review.rating}/5 - {review.likesCount} likes
          </Meta>
          <MediaPreview
            uri={review.media[0]?.url}
            mediaType={review.media[0]?.type}
            fallbackText="Review media is unavailable for this plate review."
          />
          <Text style={{ marginTop: 8 }}>{review.comment || "No comment added."}</Text>
        </Card>
      ))}
    </Screen>
  );
}
