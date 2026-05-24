const { env } = require("../config/env");
const Plate = require("../models/Plate");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Like = require("../models/Like");
const { calculateDistanceMeters } = require("../utils/geo");
const { createServiceError } = require("./serviceError");


class ReviewService {
  async listFeed() {
    const reviews = await Review.find({})
      .populate("user", "fullName avatarUrl")
      .populate("restaurant", "_id name")
      .populate("plate", "_id name")
      .sort({ createdAt: -1 })
      .limit(20);

    return { items: reviews };
  }

  validateReviewPayload(data) {
    const { restaurantId, rating, media = [] } = data;

    if (!restaurantId) {
      throw createServiceError(400, "restaurantId is required");
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw createServiceError(400, "rating must be between 1 and 5");
    }

    if (media.some((item) => item.source && item.source !== "camera")) {
      throw createServiceError(400, "Review media must come from the live camera flow");
    }

    if (media.length !== 1) {
      throw createServiceError(400, "A review must include exactly one live photo or one live video");
    }

    if (media[0].type !== "image" && media[0].type !== "video") {
      throw createServiceError(400, "Review media must be an image or a video");
    }

    if (!media[0].url || typeof media[0].url !== "string") {
      throw createServiceError(400, "Review media must include a Cloudinary secure_url");
    }
  }
}


module.exports = new ReviewService();