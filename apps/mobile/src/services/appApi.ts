import {
  ManagerDashboard,
  Plate,
  PlateDetailsResponse,
  Restaurant,
  RestaurantDetailsResponse,
  Review,
} from "../types/api";
import { apiRequest } from "./http";
export function getRestaurants(search?: string) {
  const query = search ? `?q=${encodeURIComponent(search)}` : "";
  return apiRequest<{ items: Restaurant[] }>(`/restaurants${query}`);
}

export function getRestaurantDetails(restaurantId: string) {
  return apiRequest<RestaurantDetailsResponse>(`/restaurants/${restaurantId}`);
}

export function getPlates(restaurantId?: string) {
  const query = restaurantId ? `?restaurantId=${restaurantId}` : "";
  return apiRequest<{ items: Plate[] }>(`/plates${query}`);
}

export function getPlateDetails(plateId: string) {
  return apiRequest<PlateDetailsResponse>(`/plates/${plateId}`);
}

export function getFeed() {
  return apiRequest<{ items: Review[] }>("/reviews/feed");
}

export function createReview(
  token: string,
  payload: {
    restaurantId: string;
    plateId?: string;
    rating: number;
    comment: string;
    submittedCoordinates?: {
      lat: number;
      lng: number;
    };
    media: Array<{
      type: "image" | "video";
      url: string;
      thumbnailUrl?: string;
      source: "camera";
    }>;
  }
) {
  return apiRequest<{ review: Review }>("/reviews", {
    method: "POST",
    token,
    body: payload,
    timeoutMs: 20000,
  });
}

export function likeReview(token: string, reviewId: string) {
  return apiRequest<{ likesCount: number }>(`/reviews/${reviewId}/like`, {
    method: "POST",
    token,
  });
}

export function getManagerDashboard(token: string) {
  return apiRequest<ManagerDashboard>("/manager/dashboard", { token });
}

export function getManagerReviews(token: string) {
  return apiRequest<{ items: Review[] }>("/manager/reviews", { token });
}

export function getManagerRestaurant(token: string) {
  return apiRequest<{ restaurant: Restaurant }>("/manager/restaurant", { token });
}

export function saveManagerRestaurant(
  token: string,
  payload: {
    name: string;
    description: string;
    coverImageUrl: string;
    cuisineTags: string[];
    location: {
      address: string;
      coordinates: [number, number];
    };
  },
  mode: "POST" | "PUT"
) {
  return apiRequest<{ restaurant: Restaurant }>("/manager/restaurant", {
    method: mode,
    token,
    body: payload,
  });
}

export function getManagerPlates(token: string) {
  return apiRequest<{ items: Plate[] }>("/manager/plates", { token });
}

export function createManagerPlate(
  token: string,
  payload: {
    name: string;
    description: string;
    imageUrl: string;
    price: number | null;
    isAvailable: boolean;
  }
) {
  return apiRequest<{ plate: Plate }>("/manager/plates", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateManagerPlate(
  token: string,
  plateId: string,
  payload: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    price: number | null;
    isAvailable: boolean;
  }>
) {
  return apiRequest<{ plate: Plate }>(`/manager/plates/${plateId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}