import { Platform } from "react-native";

const envApiUrl =
  typeof process !== "undefined" ? process.env.EXPO_PUBLIC_API_URL : undefined;
const envCloudinaryCloudName =
  typeof process !== "undefined" ? process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME : undefined;
const envCloudinaryUploadPreset =
  typeof process !== "undefined" ? process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET : undefined;
const envEnforceLocationVerification =
  typeof process !== "undefined"
    ? process.env.EXPO_PUBLIC_ENFORCE_LOCATION_VERIFICATION
    : undefined;

export const API_BASE_URL =
  envApiUrl ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://127.0.0.1:5000/api");

export const CLOUDINARY_CLOUD_NAME = envCloudinaryCloudName || "";
export const CLOUDINARY_UPLOAD_PRESET = envCloudinaryUploadPreset || "";
export const ENFORCE_LOCATION_VERIFICATION =
  String(envEnforceLocationVerification || "false").toLowerCase() === "true";

