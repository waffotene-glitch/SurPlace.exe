import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorText, MediaPreview } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";
import { getManagerRestaurant, saveManagerRestaurant } from "../../services/appApi";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { uploadManagerRestaurantCoverImage } from "../../services/uploadApi";
import {
  ManagerButton,
  ManagerCard,
  ManagerChip,
  ManagerHeader,
  ManagerInfoText,
  ManagerInput,
  ManagerLabel,
  ManagerScreen,
  ManagerSectionTitle,
  managerColors,
} from "./ManagerUi";

export function ManagerRestaurantScreen() {
  const { token, refreshProfile } = useAuth();
  const formTask = useAsyncTask();
  const uploadTask = useAsyncTask();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [cuisineTags, setCuisineTags] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [localCoverPreviewUri, setLocalCoverPreviewUri] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const formatAddress = (value: Location.LocationGeocodedAddress | null) => {
    if (!value) {
      return "";
    }

    return [value.name, value.street, value.city, value.region, value.postalCode, value.country]
      .filter(Boolean)
      .join(", ");
  };

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return;
      }

      const load = async () => {
        try {
          const response = await getManagerRestaurant(token);
          setRestaurantId(response.restaurant.id);
          setName(response.restaurant.name);
          setDescription(response.restaurant.description);
          setCoverImageUrl(response.restaurant.coverImageUrl);
          setCuisineTags(response.restaurant.cuisineTags.join(", "));
          setAddress(response.restaurant.location.address);
          setCoordinates(response.restaurant.location.coordinates.coordinates);
          setLocalCoverPreviewUri(response.restaurant.coverImageUrl || null);
          setUploadStatus(null);
          setLocationMessage(
            response.restaurant.location.coordinates.coordinates?.length
              ? response.restaurant.location.address || "Location selected"
              : null
          );
          formTask.setError(null);
        } catch (_loadError) {
          setRestaurantId(null);
        }
      };

      void load();
    }, [token])
  );

  const startCoverImageSelection = useCallback(
    async (mode: "camera" | "gallery") => {
      const permission =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        throw new Error(
          mode === "camera"
            ? "Camera permission is required to take a restaurant cover photo."
            : "Photo library permission is required to select a restaurant cover image."
        );
      }

      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      setLocalCoverPreviewUri(pickedUri);
      setUploadStatus("Uploading image...");

      try {
        const uploadedUrl = await uploadTask.run(() =>
          uploadManagerRestaurantCoverImage({
            uri: pickedUri,
          })
        );
        setCoverImageUrl(uploadedUrl);
        setLocalCoverPreviewUri(uploadedUrl);
        setUploadStatus("Upload complete");
      } catch (uploadError) {
        setUploadStatus(null);
        setLocalCoverPreviewUri(coverImageUrl || null);
        throw uploadError;
      }
    },
    [coverImageUrl, uploadTask]
  );

  const activeError = uploadTask.error || formTask.error;
  const activePreviewUri = localCoverPreviewUri || coverImageUrl;
  const isBusy = uploadTask.isLoading || formTask.isLoading;

  return (
    <ManagerScreen scroll>
      <ManagerHeader
        title="Manage your restaurant"
        subtitle="Keep your details up to date."
      />

      <ManagerCard accent>
        <Text style={styles.heroTitle}>{name || "Your restaurant"}</Text>
        <View style={styles.chipRow}>
          <ManagerChip label={restaurantId ? "Existing restaurant" : "New restaurant"} active />
          <ManagerChip
            label={coordinates ? "Location selected" : "Location missing"}
            active={!!coordinates}
            tone={coordinates ? "success" : "danger"}
          />
        </View>
        {activePreviewUri?.trim() ? (
          <MediaPreview uri={activePreviewUri} height={190} fallbackText="Cover image preview is unavailable." />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderTitle}>Cover image preview</Text>
            <ManagerInfoText tone="muted">
              Add a cover image for your restaurant.
            </ManagerInfoText>
          </View>
        )}
        {uploadStatus ? <ManagerInfoText tone="muted">{uploadStatus}</ManagerInfoText> : null}
      </ManagerCard>

      <ManagerSectionTitle
        title="Restaurant details"
        subtitle="Update the information guests will see."
      />
      <ManagerCard>
        <ManagerLabel>Restaurant name</ManagerLabel>
        <ManagerInput value={name} onChangeText={setName} placeholder="Restaurant name" />
        <ManagerLabel>Description</ManagerLabel>
        <ManagerInput value={description} onChangeText={setDescription} multiline placeholder="Describe the restaurant" />
        <ManagerLabel>Cover image</ManagerLabel>
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <ManagerButton
              label={uploadTask.isLoading ? "Uploading..." : "Take photo"}
              variant="secondary"
              disabled={isBusy}
              onPress={() => {
                void startCoverImageSelection("camera").catch((selectionError) => {
                  Alert.alert(
                    "Restaurant cover image",
                    selectionError instanceof Error
                      ? selectionError.message
                      : "Unable to capture a restaurant cover image."
                  );
                });
              }}
            />
          </View>
          <View style={styles.actionButton}>
            <ManagerButton
              label={uploadTask.isLoading ? "Uploading..." : "Choose from gallery"}
              variant="secondary"
              disabled={isBusy}
              onPress={() => {
                void startCoverImageSelection("gallery").catch((selectionError) => {
                  Alert.alert(
                    "Restaurant cover image",
                    selectionError instanceof Error
                      ? selectionError.message
                      : "Unable to select a restaurant cover image."
                  );
                });
              }}
            />
          </View>
        </View>
        {coverImageUrl ? (
          <ManagerInfoText tone="success">Cover image ready</ManagerInfoText>
        ) : (
          <ManagerInfoText tone="muted">No cover image yet.</ManagerInfoText>
        )}
        {coverImageUrl ? (
          <ManagerButton
            label="Remove selected cover image"
            variant="ghost"
            disabled={isBusy}
            onPress={() => {
              setCoverImageUrl("");
              setLocalCoverPreviewUri(null);
              setUploadStatus(null);
            }}
          />
        ) : null}
        <ManagerLabel>Cuisine tags (comma separated)</ManagerLabel>
        <ManagerInput value={cuisineTags} onChangeText={setCuisineTags} placeholder="Grill, Local, Seafood" />
      </ManagerCard>

      <ManagerSectionTitle
        title="Location"
        subtitle="Choose where guests can find you."
      />
      <ManagerCard>
        <ManagerButton
          label="Use my current location"
          variant="secondary"
          disabled={isBusy}
          onPress={() => {
            void formTask.run(async () => {
              formTask.setError(null);
              setLocationMessage(null);

              const permission = await Location.requestForegroundPermissionsAsync();
              if (permission.status !== "granted") {
                setLocationMessage("Location permission is required to set your restaurant location.");
                return;
              }

              const currentPosition = await Location.getCurrentPositionAsync({});
              const nextCoordinates: [number, number] = [
                currentPosition.coords.longitude,
                currentPosition.coords.latitude,
              ];
              setCoordinates(nextCoordinates);

              try {
                const results = await Location.reverseGeocodeAsync({
                  latitude: currentPosition.coords.latitude,
                  longitude: currentPosition.coords.longitude,
                });
                const readableAddress = formatAddress(results[0] ?? null);
                if (readableAddress) {
                  setAddress(readableAddress);
                  setLocationMessage(readableAddress);
                  return;
                }
              } catch (_reverseGeocodeError) {
              }

              setAddress("Current location");
              setLocationMessage("Location selected");
            });
          }}
        />
        <ManagerInfoText tone={coordinates ? "success" : "muted"}>
          {coordinates ? address || "Location selected" : "No location selected yet."}
        </ManagerInfoText>
        {locationMessage ? <Text style={styles.locationMessage}>{locationMessage}</Text> : null}
      </ManagerCard>

      <ErrorText message={activeError} />
      <ManagerButton
        label={formTask.isLoading ? "Saving..." : restaurantId ? "Update restaurant" : "Create restaurant"}
        disabled={isBusy}
        onPress={() => {
          if (!token) {
            return;
          }

          if (uploadTask.isLoading) {
            uploadTask.setError("Wait for the cover image upload to finish before saving.");
            return;
          }

          void formTask.run(async () => {
            if (!coordinates) {
              throw new Error("Please select your restaurant location before continuing.");
            }

            await saveManagerRestaurant(
              token,
              {
                name,
                description,
                coverImageUrl,
                cuisineTags: cuisineTags
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                location: {
                  address,
                  coordinates,
                },
              },
              restaurantId ? "PUT" : "POST"
            );
            await refreshProfile();
          });
        }}
      />
    </ManagerScreen>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    color: managerColors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    marginBottom: 14,
  },
  previewPlaceholder: {
    minHeight: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: managerColors.borderSoft,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  previewPlaceholderTitle: {
    color: managerColors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  actionButton: {
    flex: 1,
    minWidth: 180,
    marginRight: 10,
  },
  locationMessage: {
    marginTop: 8,
    color: managerColors.textMuted,
  },
});
