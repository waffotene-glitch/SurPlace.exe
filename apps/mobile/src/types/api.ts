export type UserRole = "user" | "manager";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  managedRestaurant?: string | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Restaurant = {
  id: string;
  manager?: string;
  name: string;
  description: string;
  coverImageUrl: string;
  cuisineTags: string[];
  location: {
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  averageRating: number;
  totalReviews: number;
};

export type Plate = {
  id: string;
  restaurant: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number | null;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
};

export type ReviewTargetType = "restaurant" | "plate";

export type Review = {
  _id: string;
  targetType: ReviewTargetType;
  rating: number;
  comment: string;
  media: Array<{
    type?: "image" | "video";
    mediaType?: "image" | "video";
    resourceType?: "image" | "video";
    url?: string;
    secureUrl?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    source: "camera";
  }>;
  likesCount: number;
  createdAt: string;
  user?: {
    fullName: string;
    avatarUrl?: string;
  };
  restaurant?: {
    _id: string;
    name: string;
  };
  plate?: {
    _id: string;
    name: string;
  } | null;
  verification: {
    submittedCoordinates?: {
      lat: number;
      lng: number;
    } | null;
    distanceMeters?: number | null;
    radiusMeters?: number | null;
    isVerifiedOnSite: boolean;
  };
};

export type RestaurantDetailsResponse = {
  restaurant: Restaurant;
  plates: Plate[];
  recentReviews: Review[];
};

export type ManagerDashboard = {
  restaurant: Restaurant | null;
  averageRating: number;
  recentReviews: Review[];
  plates: Plate[];
};

export type PlateDetailsResponse = {
  plate: Plate;
  restaurant: {
    id: string;
    name: string;
    address: string;
    coverImageUrl: string;
  };
  reviews: Review[];
};
