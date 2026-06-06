import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Button, ErrorText } from "../../components/AppUi";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { useAuth } from "../../context/AuthContext";
import { useReviewDraft } from "../../context/ReviewDraftContext";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
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
  const [recordWithSound, setRecordWithSound] = useState(true);

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
      <View style={styles.authShell}>
        <Text style={styles.authTitle}>Authentication required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Verified review</Text>
        <Text style={styles.heroTitle}>Share your real experience</Text>
        <Text style={styles.heroSubtitle}>
          {plateName ? `${restaurantName} · ${plateName}` : restaurantName}
        </Text>
        <Text style={styles.heroBody}>One live photo or video is required.</Text>
        <Text style={styles.heroNote}>Location may be requested.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Your rating</Text>
        <View style={styles.ratingRow}>
          {["1", "2", "3", "4", "5"].map((value) => {
            const active = draft.rating === value;
            return (
              <Pressable
                key={value}
                onPress={() => updateDraft({ rating: value })}
                style={[styles.ratingPill, active && styles.ratingPillActive]}
              >
                <Text style={[styles.ratingPillText, active && styles.ratingPillTextActive]}>
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Comment</Text>
        <View style={styles.textAreaShell}>
          <Text style={styles.textAreaLabel}>Your thoughts</Text>
          <View style={styles.commentEditor}>
            <View style={styles.inputFrame}>
              <TextInput
                value={draft.comment}
                onChangeText={(value) => updateDraft({ comment: value })}
                placeholder="What did you think about the food and service?"
                placeholderTextColor="#9ca3af"
                multiline
                style={styles.textArea}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.captureGrid}>
        <Pressable
          onPress={() => navigation.navigate("ReviewCamera", { captureMode: "image" })}
          style={[
            styles.captureCard,
            draft.capturedMediaType === "image" ? styles.captureCardActive : null,
          ]}
        >
          <View style={styles.captureHeader}>
            <View style={[styles.captureIconWrap, styles.captureIconWarm]}>
              <Ionicons
                name={draft.capturedMediaType === "image" ? "checkmark-circle" : "camera-outline"}
                size={22}
                color="#ffffff"
              />
            </View>
            <View style={styles.captureTextWrap}>
              <Text style={styles.captureTitle}>
                {draft.capturedMediaType === "image" ? "Replace live photo" : "Take live photo"}
              </Text>
              <Text style={styles.captureBody}>Capture the meal, table, or plating clearly.</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("ReviewCamera", { captureMode: "video", recordWithSound })}
          style={[
            styles.captureCard,
            styles.captureCardDark,
            draft.capturedMediaType === "video" ? styles.captureCardVideoActive : null,
          ]}
        >
          <View style={styles.captureHeader}>
            <View style={[styles.captureIconWrap, styles.captureIconCool]}>
              <Ionicons
                name={draft.capturedMediaType === "video" ? "checkmark-circle" : "videocam-outline"}
                size={22}
                color="#ffffff"
              />
            </View>
            <View style={styles.captureTextWrap}>
              <Text style={[styles.captureTitle, styles.captureTitleDark]}>
                {draft.capturedMediaType === "video" ? "Replace short video" : "Record short video"}
              </Text>
              <Text style={[styles.captureBody, styles.captureBodyDark]}>Show the atmosphere in one quick clip.</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.soundOptionCard}>
          <View style={styles.soundOptionTextWrap}>
            <Text style={styles.soundOptionTitle}>Record with sound</Text>
            <Text style={styles.soundOptionBody}>
              {recordWithSound ? "Microphone permission will be requested." : "Video will be recorded without audio."}
            </Text>
          </View>
          <Switch
            value={recordWithSound}
            onValueChange={setRecordWithSound}
            trackColor={{ false: "#d1d5db", true: "#f6a27d" }}
            thumbColor={recordWithSound ? "#f26b3a" : "#f9fafb"}
          />
        </View>
      </View>

      {draft.capturedMediaUri ? (
        <View style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Selected media</Text>
          {draft.capturedMediaType === "image" ? (
            <Image source={{ uri: draft.capturedMediaUri }} style={styles.previewImage} />
          ) : (
            <Video
              source={{ uri: draft.capturedMediaUri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode={ResizeMode.COVER}
            />
          )}
          <Text style={styles.previewMeta}>
            {draft.capturedMediaType === "video"
              ? "One live video selected for this review."
              : "One live photo selected for this review."}
          </Text>
          <Button
            label="Remove selected media"
            variant="secondary"
            onPress={() => updateDraft({ capturedMediaUri: null, capturedMediaType: null })}
          />
        </View>
      ) : (
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Before you submit</Text>
          <Text style={styles.tipLine}>One live photo or video is required.</Text>
          <Text style={styles.tipLine}>Location may be requested.</Text>
        </View>
      )}

      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
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
            setStatusMessage("Getting location...");

            let permission: Location.LocationPermissionResponse;
            try {
              permission = await withTimeout(
                Location.requestForegroundPermissionsAsync(),
                10000,
                "Location permission is required to submit a review."
              );
            } catch (_permissionError) {
              throw new Error("Location permission is required to submit a review.");
            }

            if (permission.status !== "granted") {
              throw new Error("Location permission is required to submit a review.");
            }

            let currentPosition: Location.LocationObject;
            try {
              currentPosition = await withTimeout(
                Location.getCurrentPositionAsync({}),
                12000,
                "We could not get your location. Please try again."
              );
            } catch (_locationError) {
              throw new Error("We could not get your location. Please try again.");
            }

            const submittedCoordinates = {
              lat: currentPosition.coords.latitude,
              lng: currentPosition.coords.longitude,
            };

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff8f3",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  authShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8f3",
    padding: 24,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#18181b",
  },
  heroCard: {
    backgroundColor: "#171717",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroEyebrow: {
    color: "#f6a27d",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  heroBody: {
    color: "#e5e7eb",
    lineHeight: 20,
  },
  heroNote: {
    color: "#d4d4d8",
    lineHeight: 19,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  ratingPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f3d8cc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff6f1",
  },
  ratingPillActive: {
    backgroundColor: "#f26b3a",
    borderColor: "#f26b3a",
  },
  ratingPillText: {
    color: "#c25128",
    fontWeight: "800",
    fontSize: 16,
  },
  ratingPillTextActive: {
    color: "#ffffff",
  },
  textAreaShell: {
    marginTop: 2,
  },
  textAreaLabel: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  commentEditor: {
    borderRadius: 16,
    backgroundColor: "#fff8f3",
    padding: 12,
  },
  inputFrame: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfd6",
    padding: 10,
  },
  textArea: {
    minHeight: 120,
    color: "#111827",
    textAlignVertical: "top",
  },
  captureGrid: {
    gap: 12,
    marginBottom: 14,
  },
  captureCard: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 18,
    borderWidth: 1,
    borderColor: "#f0dfd6",
  },
  captureCardActive: {
    borderColor: "#f26b3a",
    backgroundColor: "#fff4ee",
  },
  captureCardDark: {
    backgroundColor: "#1a1a1a",
    borderColor: "#303030",
  },
  captureCardVideoActive: {
    borderColor: "#7fd4c8",
    backgroundColor: "#162124",
  },
  captureHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  captureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  captureIconWarm: {
    backgroundColor: "#f26b3a",
  },
  captureIconCool: {
    backgroundColor: "#1f6f78",
  },
  captureTextWrap: {
    flex: 1,
  },
  captureTitle: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  captureTitleDark: {
    color: "#ffffff",
  },
  captureBody: {
    color: "#6b7280",
    lineHeight: 20,
  },
  captureBodyDark: {
    color: "#d4d4d8",
  },
  soundOptionCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfd6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  soundOptionTextWrap: {
    flex: 1,
  },
  soundOptionTitle: {
    color: "#18181b",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  soundOptionBody: {
    color: "#6b7280",
    lineHeight: 19,
  },
  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  previewImage: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    marginBottom: 12,
  },
  previewVideo: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "#111111",
  },
  previewMeta: {
    color: "#6b7280",
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: "#fff1e8",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  tipTitle: {
    color: "#18181b",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  tipLine: {
    color: "#6b7280",
    marginBottom: 4,
  },
  statusText: {
    color: "#4b5563",
    marginBottom: 12,
  },
});
