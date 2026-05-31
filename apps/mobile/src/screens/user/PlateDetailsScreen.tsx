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