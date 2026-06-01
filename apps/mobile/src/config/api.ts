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
