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
