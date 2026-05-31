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
