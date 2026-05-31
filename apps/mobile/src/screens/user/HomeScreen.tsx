import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card, Field, LoadingState, Meta, Screen, Title } from "../../components/AppUi";
import { getPlates, getRestaurants } from "../../services/appApi";
import { Plate, Restaurant } from "../../types/api";
export function HomeScreen({ navigation }: { navigation: any }) {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [restaurantResponse, plateResponse] = await Promise.all([
          getRestaurants(),
          getPlates(),
        ]);
        setRestaurants(restaurantResponse.items);
        setPlates(plateResponse.items);
      } finally {
        setIsLoading(false);
      }
    };

     void load();
  }, []);

  const restaurantNameById = useMemo(
    () => Object.fromEntries(restaurants.map((restaurant) => [restaurant.id, restaurant.name])),
    [restaurants]
  );

  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return restaurants;
    }

    return restaurants.filter((restaurant) =>
      [restaurant.name, restaurant.description, restaurant.location.address]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [restaurants, search]);

  const filteredPlates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return plates;
    }

    return plates.filter((plate) =>
      [plate.name, plate.description, restaurantNameById[plate.restaurant] || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [plates, restaurantNameById, search]);

  
   if (isLoading) {
    return <LoadingState label="Loading nearby restaurants and plates..." />;
  }

  return (
    <Screen scroll>
      <Title subtitle="Browse restaurants and plates with a simpler, stronger home layout.">
        User Home
      </Title>
      <Field
        label="Search restaurants or plates"
        value={search}
        onChangeText={setSearch}
        placeholder="Maison du Piment or Grilled Fish"
      />

      <Text style={{ marginBottom: 10, fontWeight: "700", fontSize: 18 }}>Restaurants</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {filteredRestaurants.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            onPress={() =>
              navigation.navigate("RestaurantDetails", {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              })
            }
            style={{ width: 280, marginRight: 12 }}
          >
            <Card>
              {restaurant.coverImageUrl ? (
                <Image
                  source={{ uri: restaurant.coverImageUrl }}
                  style={{ width: "100%", height: 140, borderRadius: 14, marginBottom: 10 }}
                />
              ) : null}
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#232323" }}>
                {restaurant.name}
              </Text>
              <Meta>
                Rating {restaurant.averageRating.toFixed(1)} - {restaurant.totalReviews} reviews
              </Meta>
              <Meta>{restaurant.location.address}</Meta>
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={{ marginBottom: 10, fontWeight: "700", fontSize: 18 }}>Plates</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredPlates.map((plate) => (
          <Pressable
            key={plate.id}
            onPress={() =>
              navigation.navigate("PlateDetails", {
                plateId: plate.id,
                plateName: plate.name,
                restaurantId: plate.restaurant,
                restaurantName: restaurantNameById[plate.restaurant],
              })
            }
            style={{ width: 280, marginRight: 12 }}
          >
            <Card>
              {plate.imageUrl ? (
                <Image
                  source={{ uri: plate.imageUrl }}
                  style={{ width: "100%", height: 140, borderRadius: 14, marginBottom: 10 }}
                />
              ) : null}
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#232323" }}>{plate.name}</Text>
              <Meta>{restaurantNameById[plate.restaurant] || "Restaurant"}</Meta>
              <Meta>
                Rating {plate.averageRating.toFixed(1)} - {plate.totalReviews} reviews
              </Meta>
            </Card>
          </Pressable>
        ))}