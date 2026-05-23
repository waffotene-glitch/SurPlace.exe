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