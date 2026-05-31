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