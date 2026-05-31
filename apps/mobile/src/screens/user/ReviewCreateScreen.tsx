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

      <Field
        label="Comment"
        value={draft.comment}
        onChangeText={(value) => updateDraft({ comment: value })}
        placeholder="What did you think about the food and service?"
        multiline
      />
      <Button
        label={draft.capturedMediaType === "image" ? "Replace live photo" : "Take live photo"}
        variant="secondary"
        onPress={() => navigation.navigate("ReviewCamera", { captureMode: "image" })}
      />
      <Button
        label={draft.capturedMediaType === "video" ? "Replace live video" : "Record live video"}
        variant="secondary"
        onPress={() => navigation.navigate("ReviewCamera", { captureMode: "video" })}
      />
      {draft.capturedMediaUri ? (
        <View style={{ marginBottom: 16 }}>
          {draft.capturedMediaType === "image" ? (
            <Image
              source={{ uri: draft.capturedMediaUri }}
              style={{ width: "100%", height: 220, borderRadius: 16 }}
            />
          ) : (
            <Video
              source={{ uri: draft.capturedMediaUri }}
              style={{ width: "100%", height: 200, borderRadius: 16, backgroundColor: "#111111" }}
              useNativeControls
              resizeMode={ResizeMode.COVER}
            />
          )}
          <Meta>
            {draft.capturedMediaType === "video"
              ? "One live video selected for this review."
              : "One live photo selected for this review."}
          </Meta>
          <Button
            label="Remove selected media"
            variant="secondary"
            onPress={() => updateDraft({ capturedMediaUri: null, capturedMediaType: null })}
          />
        </View>

         ) : null}
      {statusMessage ? (
        <Text style={{ marginBottom: 12, color: "#5b5b5b" }}>{statusMessage}</Text>
      ) : null}
      <ErrorText message={error} />
      <Button
        label={isLoading ? "Submitting..." : "Submit review"}
        disabled={isLoading}
        onPress={() => {
          if (!draft.capturedMediaUri || !draft.capturedMediaType) {
            setError("Please capture a live photo or video before submitting your review.");
            return;
          }

          const capturedMediaUri = draft.capturedMediaUri;
          const capturedMediaType = draft.capturedMediaType;

          void run(async () => {
            let submittedCoordinates:
              | {
                  lat: number;
                  lng: number;
                }
              | undefined;

            setStatusMessage("Getting location...");

            try {
              const permission = await withTimeout(
                Location.requestForegroundPermissionsAsync(),
                10000,
                "Location permission request timed out."
              );

              if (permission.status === "granted") {
                try {
                  const currentPosition = await withTimeout(
                    Location.getCurrentPositionAsync({}),
                    12000,
                    "Fetching your location timed out."
                  );
                  submittedCoordinates = {
                    lat: currentPosition.coords.latitude,
                    lng: currentPosition.coords.longitude,
                  };
                } catch (_locationError) {
                  // Submission can continue without coordinates when verification is not enforced.
                }
              }
            } catch (_permissionError) {
              // Submission can continue without coordinates when verification is not enforced.
            }

            setStatusMessage("Uploading media...");
            const uploadedMedia = await uploadReviewMedia({
              uri: capturedMediaUri,
              mediaType: capturedMediaType,
            });

            setStatusMessage("Saving review...");
            await createReview(token, {
              restaurantId,
              plateId,
              rating: Number(draft.rating),
              comment: draft.comment,
              submittedCoordinates,
              media: [uploadedMedia],
            });

            markReviewsUpdated();
            setStatusMessage("Review submitted successfully.");
            resetDraft();
            Alert.alert("Success", "Review submitted successfully.", [
              {
                text: "OK",
                onPress: () => {
                  setStatusMessage(null);
                  navigation.goBack();
                },
              },
            ]);
          }).catch(() => {
            setStatusMessage(null);
          });
        }}
      />
    </Screen>
  );
}
