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

  async createReview({ user, data }) {
    const {
      restaurantId,
      plateId = null,
      rating,
      comment = "",
      submittedCoordinates,
      media = [],
    } = data;

    this.validateReviewPayload(data);

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw createServiceError(404, "Restaurant not found");
    }

    let plate = null;
    if (plateId) {
      plate = await Plate.findById(plateId);
      if (!plate) {
        throw createServiceError(404, "Plate not found");
      }

      if (String(plate.restaurant) !== String(restaurant._id)) {
        throw createServiceError(400, "Plate must belong to the same restaurant");
      }
    }

    const hasSubmittedCoordinates =
      submittedCoordinates &&
      typeof submittedCoordinates.lat === "number" &&
      typeof submittedCoordinates.lng === "number";

    let distanceMeters = null;
    let isWithinAllowedRadius = false;

    if (hasSubmittedCoordinates) {
      const restaurantCoordinates = {
        lng: restaurant.location.coordinates.coordinates[0],
        lat: restaurant.location.coordinates.coordinates[1],
      };

      distanceMeters = calculateDistanceMeters(submittedCoordinates, restaurantCoordinates);
      isWithinAllowedRadius = distanceMeters <= env.reviewVerificationRadiusMeters;
    }

    if (env.enforceLocationVerification) {
      if (!hasSubmittedCoordinates) {
        throw createServiceError(
          403,
          "Location permission is required while strict location verification is enabled"
        );
      }

      if (!isWithinAllowedRadius) {
        throw createServiceError(403, "You must be near this restaurant to submit a verified review");
      }
    }

    const review = await Review.create({
      user: user._id,
      restaurant: restaurant._id,
      plate: plate ? plate._id : null,
      targetType: plate ? "plate" : "restaurant",
      rating,
      comment,
      media,
      verification: {
        submittedCoordinates: hasSubmittedCoordinates ? submittedCoordinates : undefined,
        distanceMeters,
        radiusMeters: hasSubmittedCoordinates ? env.reviewVerificationRadiusMeters : null,
        isVerifiedOnSite: isWithinAllowedRadius,
      },
    });

    return {
      statusCode: 201,
      body: { review },
    };
  }

  async likeReview({ userId, reviewId }) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw createServiceError(404, "Review not found");
    }

    try {
      await Like.create({
        user: userId,
        review: review._id,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw createServiceError(409, "Review already liked by this user");
      }

      throw error;
    }

    review.likesCount += 1;
    await review.save();

    return {
      statusCode: 201,
      body: { likesCount: review.likesCount },
    };
  }
  
}


module.exports = new ReviewService();