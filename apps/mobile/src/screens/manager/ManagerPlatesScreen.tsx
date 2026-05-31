import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorText, MediaPreview } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";
import {
  createManagerPlate,
  deleteManagerPlate,
  getManagerPlates,
  updateManagerPlate,
} from "../../services/appApi";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { uploadManagerPlateImage } from "../../services/uploadApi";
import { Plate } from "../../types/api";
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

export function ManagerPlatesScreen() {
  const { token } = useAuth();
  const saveTask = useAsyncTask();
  const deleteTask = useAsyncTask();
  const uploadTask = useAsyncTask();
  const [plates, setPlates] = useState<Plate[]>([]);
  const [editingPlateId, setEditingPlateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [localImagePreviewUri, setLocalImagePreviewUri] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await getManagerPlates(token);
    setPlates(response.items);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const resetForm = () => {
    setEditingPlateId(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setLocalImagePreviewUri(null);
    setUploadStatus(null);
  };

  const startImageSelection = useCallback(
    async (mode: "camera" | "gallery") => {
      const permission =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        throw new Error(
          mode === "camera"
            ? "Camera permission is required to take a plate photo."
            : "Photo library permission is required to select a plate image."
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
      setLocalImagePreviewUri(pickedUri);
      setUploadStatus("Uploading image...");

      try {
        const uploadedUrl = await uploadTask.run(() =>
          uploadManagerPlateImage({
            uri: pickedUri,
          })
        );
        setImageUrl(uploadedUrl);
        setLocalImagePreviewUri(uploadedUrl);
        setUploadStatus("Upload complete");
      } catch (uploadError) {
        setUploadStatus(null);
        setLocalImagePreviewUri(null);
        throw uploadError;
      }
    },
    [uploadTask]
  );

  const confirmDeletePlate = useCallback(
    (plate: Plate) => {
      if (!token) {
        return;
      }

      Alert.alert("Delete this plate?", "This action cannot be undone.", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteTask
              .run(async () => {
                await deleteManagerPlate(token, plate.id);
                setPlates((currentPlates) => currentPlates.filter((item) => item.id !== plate.id));
                if (editingPlateId === plate.id) {
                  resetForm();
                }
                setStatusMessage(`"${plate.name}" deleted successfully.`);
                Alert.alert("Success", "Plate deleted successfully.");
              })
              .catch((deleteError) => {
                Alert.alert(
                  "Delete failed",
                  deleteError instanceof Error
                    ? deleteError.message
                    : "Unable to delete this plate right now."
                );
              });
          },
        },
      ]);
    },
    [deleteTask, editingPlateId, token]
  );

  const activeError = uploadTask.error || saveTask.error || deleteTask.error;
  const activePreviewUri = localImagePreviewUri || imageUrl;
  const isBusy = uploadTask.isLoading || saveTask.isLoading || deleteTask.isLoading;

  return (
    <ManagerScreen scroll>
      <ManagerHeader
        title="Manage dishes"
        subtitle="Add and update your menu."
        right={<ManagerChip label={`${plates.length} items`} active />}
      />

      <ManagerCard accent>
        <Text style={styles.heroTitle}>{editingPlateId ? "Editing dish" : "Add a dish"}</Text>
        {activePreviewUri?.trim() ? (
          <MediaPreview uri={activePreviewUri} height={180} fallbackText="Plate image preview is unavailable." />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderTitle}>Plate image preview</Text>
            <ManagerInfoText tone="muted">
              Add a photo for this dish.
            </ManagerInfoText>
          </View>
        )}
        {uploadStatus ? <ManagerInfoText tone="muted">{uploadStatus}</ManagerInfoText> : null}
      </ManagerCard>

      <ManagerSectionTitle
        title="Plate form"
        subtitle={
          editingPlateId
            ? "Update the selected dish."
            : "Add a new dish to your menu."
        }
      />
      <ManagerCard>
        <ManagerLabel>Plate name</ManagerLabel>
        <ManagerInput value={name} onChangeText={setName} placeholder="Plate name" />
        <ManagerLabel>Description</ManagerLabel>
        <ManagerInput value={description} onChangeText={setDescription} multiline placeholder="Describe the plate" />
        <ManagerLabel>Plate image</ManagerLabel>
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <ManagerButton
              label={uploadTask.isLoading ? "Uploading..." : "Take photo"}
              variant="secondary"
              disabled={isBusy}
              onPress={() => {
                void startImageSelection("camera").catch((selectionError) => {
                  Alert.alert(
                    "Plate image",
                    selectionError instanceof Error
                      ? selectionError.message
                      : "Unable to capture a plate image."
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
                void startImageSelection("gallery").catch((selectionError) => {
                  Alert.alert(
                    "Plate image",
                    selectionError instanceof Error
                      ? selectionError.message
                      : "Unable to select a plate image."
                  );
                });
              }}
            />
          </View>
        </View>
        {imageUrl ? (
          <ManagerInfoText tone="success">Media ready</ManagerInfoText>
        ) : (
          <ManagerInfoText tone="muted">No image yet.</ManagerInfoText>
        )}
        {imageUrl ? (
          <ManagerButton
            label="Remove selected image"
            variant="ghost"
            disabled={isBusy}
            onPress={() => {
              setImageUrl("");
              setLocalImagePreviewUri(null);
              setUploadStatus(null);
            }}
          />
        ) : null}
        <ManagerLabel>Price</ManagerLabel>
        <ManagerInput value={price} onChangeText={setPrice} placeholder="4500" />
      </ManagerCard>

      <ErrorText message={activeError} />
      {statusMessage ? <ManagerInfoText tone="success">{statusMessage}</ManagerInfoText> : null}
      <ManagerButton
        label={saveTask.isLoading ? "Saving..." : editingPlateId ? "Update plate" : "Add plate"}
        disabled={isBusy}
        onPress={() => {
          if (!token) {
            return;
          }

          if (uploadTask.isLoading) {
            uploadTask.setError("Wait for the plate image upload to finish before saving.");
            return;
          }

          void saveTask.run(async () => {
            if (editingPlateId) {
              await updateManagerPlate(token, editingPlateId, {
                name,
                description,
                imageUrl,
                price: price ? Number(price) : null,
              });
            } else {
              await createManagerPlate(token, {
                name,
                description,
                imageUrl,
                price: price ? Number(price) : null,
                isAvailable: true,
              });
            }

            await load();
            setStatusMessage(editingPlateId ? "Plate updated successfully." : "Plate added successfully.");
            resetForm();
          });
        }}
      />
      {editingPlateId ? (
        <ManagerButton label="Cancel edit" variant="secondary" disabled={isBusy} onPress={resetForm} />
      ) : null}

      <ManagerSectionTitle
        title="Current plates"
        subtitle="Tap a card to edit it."
      />
      {plates.map((plate) => (
        <ManagerCard key={plate.id}>
          <View style={styles.plateRow}>
            <View style={styles.plateMain}>
              <View style={styles.thumbWrap}>
                {plate.imageUrl ? (
                  <MediaPreview uri={plate.imageUrl} height={72} fallbackText="Plate image unavailable." />
                ) : (
                  <View style={styles.thumbFallback}>
                    <Text style={styles.thumbFallbackText}>No image</Text>
                  </View>
                )}
              </View>
              <View style={styles.plateText}>
                <Text style={styles.plateTitle}>{plate.name}</Text>
                <ManagerInfoText tone="muted">
                  {`Rating ${plate.averageRating.toFixed(1)} · ${plate.totalReviews} reviews`}
                </ManagerInfoText>
                <ManagerInfoText>
                  Price: {plate.price ? `${plate.price} XAF` : "Not set"}
                </ManagerInfoText>
              </View>
            </View>
            <ManagerChip label="Edit" active />
          </View>
          <Text style={styles.plateDescription}>{plate.description || "No description added yet."}</Text>
          <ManagerButton
            label="Load plate into editor"
            variant="ghost"
            disabled={isBusy}
            onPress={() => {
              setEditingPlateId(plate.id);
              setName(plate.name);
              setDescription(plate.description);
              setImageUrl(plate.imageUrl);
              setLocalImagePreviewUri(plate.imageUrl || null);
              setPrice(plate.price ? String(plate.price) : "");
              setUploadStatus(null);
              setStatusMessage(null);
            }}
          />
          <ManagerButton
            label={deleteTask.isLoading ? "Deleting..." : "Delete plate"}
            variant="danger"
            disabled={isBusy}
            onPress={() => {
              setStatusMessage(null);
              confirmDeletePlate(plate);
            }}
          />
        </ManagerCard>
      ))}
    </ManagerScreen>
  );
}

