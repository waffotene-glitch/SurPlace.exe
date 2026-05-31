import React, { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import * as Location from "expo-location";
import { Button, ErrorText, Field, Meta, PillGroup, Screen, Title } from "../../components/AppUi";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { useAuth } from "../../context/AuthContext";
import { useReviewDraft } from "../../context/ReviewDraftContext";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { ENFORCE_LOCATION_VERIFICATION } from "../../config/api";
import { createReview } from "../../services/appApi";
import { uploadReviewMedia } from "../../services/uploadApi";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}


export function ReviewCreateScreen({ route, navigation }: { route: any; navigation: any }) {
  const { token } = useAuth();
  const { draft, resetDraft, updateDraft } = useReviewDraft();
  const { markReviewsUpdated } = useReviewRefresh();
  const { restaurantId, restaurantName, plateId, plateName } = route.params ?? {};
  const { isLoading, error, run, setError } = useAsyncTask();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const nextPlateId = plateId ?? null;

    if (draft.restaurantId !== restaurantId || draft.plateId !== nextPlateId) {
      resetDraft({
        restaurantId,
        plateId: nextPlateId,
        rating: "5",
        comment: "",
        capturedMediaUri: null,
        capturedMediaType: null,
      });
    }
  }, [draft.plateId, draft.restaurantId, plateId, resetDraft, restaurantId]);

  if (!token) {
    return (
      <Screen>
        <Title>Authentication required</Title>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Title subtitle={plateName ? `${restaurantName} - ${plateName}` : restaurantName}>
        Create Verified Review
      </Title>
      <Text style={{ marginBottom: 12, color: "#5b5b5b" }}>
        Capture exactly one live photo or one live video. Location is still requested during
        submission for verification data.
      </Text>
      <PillGroup
        value={draft.rating}
        onChange={(value) => updateDraft({ rating: value })}
        options={[
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
        ]}
      />