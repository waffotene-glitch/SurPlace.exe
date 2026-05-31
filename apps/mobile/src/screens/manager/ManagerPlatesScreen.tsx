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
