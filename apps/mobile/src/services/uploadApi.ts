import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../config/api";

type ReviewMediaType = "image" | "video";
type CloudinaryAssetType = "image" | "video";

const UPLOAD_TIMEOUTS_MS: Record<ReviewMediaType, number> = {
  image: 60000,
  video: 120000,
};

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    !normalized ||
    normalized === "your_cloud_name" ||
    normalized === "your_upload_preset" ||
    normalized === "cloud_name" ||
    normalized === "upload_preset" ||
    normalized.includes("placeholder")
  );
}

function guessMimeType(uri: string, mediaType: ReviewMediaType) {
  const normalized = uri.toLowerCase();

  if (mediaType === "video") {
    if (normalized.endsWith(".mov")) {
      return "video/quicktime";
    }

    if (normalized.endsWith(".m4v")) {
      return "video/x-m4v";
    }

    return "video/mp4";
  }

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}

function buildFilename(uri: string, mediaType: ReviewMediaType) {
  const normalized = uri.toLowerCase();

  if (mediaType === "video") {
    if (normalized.endsWith(".mov")) {
      return `review-${Date.now()}.mov`;
    }

    if (normalized.endsWith(".m4v")) {
      return `review-${Date.now()}.m4v`;
    }

    return `review-${Date.now()}.mp4`;
  }

  if (normalized.endsWith(".png")) {
    return `review-${Date.now()}.png`;
  }

  if (normalized.endsWith(".webp")) {
    return `review-${Date.now()}.webp`;
  }

  return `review-${Date.now()}.jpg`;
}

function buildVideoThumbnailUrl(url: string) {
  const transformedUrl = url.replace("/upload/", "/upload/so_0/");

  return transformedUrl.replace(/\.[^/.?]+(\?.*)?$/, ".jpg$1");
}

async function uploadCloudinaryAsset(payload: {
  uri: string;
  mediaType: CloudinaryAssetType;
  folder: string;
  filenamePrefix: string;
}) {
  if (
    isPlaceholderValue(CLOUDINARY_CLOUD_NAME) ||
    isPlaceholderValue(CLOUDINARY_UPLOAD_PRESET)
  ) {
    throw new Error(
      "Cloudinary upload is not configured. Set real EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET values."
    );
  }

  const formData = new FormData();
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", payload.folder);
  formData.append("file", {
    uri: payload.uri,
    type: guessMimeType(payload.uri, payload.mediaType),
    name: buildFilename(payload.uri, payload.mediaType).replace("review-", `${payload.filenamePrefix}-`),
  } as any);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    UPLOAD_TIMEOUTS_MS[payload.mediaType]
  );

  let response: Response;

  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${payload.mediaType}/upload`,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );
  } catch (uploadError) {
    clearTimeout(timeoutId);

    if (uploadError instanceof Error && uploadError.name === "AbortError") {
      throw new Error("Media upload timed out. Please try again.");
    }

    throw uploadError;
  }

  clearTimeout(timeoutId);

  const data = await response.json();

  if (!data?.secure_url) {
    throw new Error("Media upload failed. Please try again.");
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || "Media upload failed. Please try again.");
  }

  return data.secure_url as string;
}

export async function uploadReviewMedia(payload: {
  uri: string;
  mediaType: ReviewMediaType;
}) {
  const secureUrl = await uploadCloudinaryAsset({
    uri: payload.uri,
    mediaType: payload.mediaType,
    folder: "verified-food-reviews",
    filenamePrefix: "review",
  });

  return {
    type: payload.mediaType,
    url: secureUrl,
    thumbnailUrl:
      payload.mediaType === "video"
        ? buildVideoThumbnailUrl(secureUrl)
        : secureUrl,
    source: "camera" as const,
  };
}

export async function uploadManagerPlateImage(payload: { uri: string }) {
  return uploadCloudinaryAsset({
    uri: payload.uri,
    mediaType: "image",
    folder: "verified-food-manager-plates",
    filenamePrefix: "plate",
  });
}

export async function uploadManagerRestaurantCoverImage(payload: { uri: string }) {
  return uploadCloudinaryAsset({
    uri: payload.uri,
    mediaType: "image",
    folder: "verified-food-manager-restaurants",
    filenamePrefix: "restaurant-cover",
  });
}