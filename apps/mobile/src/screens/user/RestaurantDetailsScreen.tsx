import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Card, CardTitle, LoadingState, MediaPreview, Meta, Screen, Title } from "../../components/AppUi";
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
    <Screen scroll>
      <Title subtitle={data.restaurant.location.address}>{data.restaurant.name}</Title>
      <Card>
        {data.restaurant.coverImageUrl ? (
          <Image
            source={{ uri: data.restaurant.coverImageUrl }}
            style={{ width: "100%", height: 190, borderRadius: 16, marginBottom: 12 }}
          />
        ) : null}
        <CardTitle>Restaurant info</CardTitle>
        <Meta>
          Rating {data.restaurant.averageRating.toFixed(1)} - {data.restaurant.totalReviews} reviews
        </Meta>
        <Meta>Address: {data.restaurant.location.address}</Meta>
        <Text style={{ marginTop: 8 }}>{data.restaurant.description}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate("ReviewCreate", {
              restaurantId: data.restaurant.id,
              restaurantName: data.restaurant.name,
            })
          }
          style={{ marginTop: 12 }}
        >
