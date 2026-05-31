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
