const { env } = require("../config/env");
const Plate = require("../models/Plate");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Like = require("../models/Like");
const { calculateDistanceMeters } = require("../utils/geo");
const { assertObjectId } = require("../utils/validators");
const { createServiceError } = require("./serviceError");


class ReviewService {
  async listFeed({ userId = null } = {}) {
    const reviews = await Review.find({})
      .populate("user", "fullName avatarUrl")
      .populate("restaurant", "_id name")
      .populate("plate", "_id name")
      .sort({ createdAt: -1 })
      .limit(20);

    if (!userId) {
      return { items: reviews };
    }

    const likes = await Like.find({
      user: userId,
      review: { $in: reviews.map((review) => review._id) },
    }).select("review");
    const likedReviewIds = new Set(likes.map((like) => String(like.review)));

    return {
      items: reviews.map((review) => ({
        ...review.toObject(),
        likedByCurrentUser: likedReviewIds.has(String(review._id)),
      })),
    };
  }

  validateReviewPayload(data) {
    const { restaurantId, rating, media = [] } = data;

    if (!restaurantId) {
      throw createServiceError(400, "restaurantId is required");
    }

    assertObjectId(restaurantId, "restaurantId");

    if (data.plateId) {
      assertObjectId(data.plateId, "plateId");
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw createServiceError(400, "rating must be between 1 and 5");
    }

    if (!Array.isArray(media)) {
      throw createServiceError(400, "media must be an array");
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
      typeof submittedCoordinates.lng === "number" &&
      Number.isFinite(submittedCoordinates.lat) &&
      Number.isFinite(submittedCoordinates.lng);

    let distanceMeters = null;
    let isWithinAllowedRadius = false;

    if (!hasSubmittedCoordinates) {
      throw createServiceError(400, "Location permission is required to submit a review.");
    }

    if (hasSubmittedCoordinates) {
      const restaurantPoint = restaurant.location?.coordinates?.coordinates;
      if (
        !Array.isArray(restaurantPoint) ||
        restaurantPoint.length !== 2 ||
        restaurantPoint.some((value) => typeof value !== "number" || Number.isNaN(value))
      ) {
        throw createServiceError(400, "Restaurant location coordinates are unavailable");
      }

      const restaurantCoordinates = {
        lng: restaurantPoint[0],
        lat: restaurantPoint[1],
      };

      distanceMeters = calculateDistanceMeters(submittedCoordinates, restaurantCoordinates);
      isWithinAllowedRadius = distanceMeters <= env.reviewVerificationRadiusMeters;
    }

    if (env.enforceLocationVerification) {
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

    await this.recalculateTargetRatings({
      restaurantId: restaurant._id,
      plateId: plate ? plate._id : null,
    });

    return {
      statusCode: 201,
      body: { review },
    };
  }

  async likeReview({ userId, reviewId }) {
    assertObjectId(reviewId, "reviewId");

    const review = await Review.findById(reviewId);

    if (!review) {
      throw createServiceError(404, "Review not found");
    }

    const existingLike = await Like.findOne({ user: userId, review: review._id });
    const liked = !existingLike;

    if (existingLike) {
      await existingLike.deleteOne();
    } else {
      try {
        await Like.create({
          user: userId,
          review: review._id,
        });
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    const likesCount = await Like.countDocuments({ review: review._id });
    const updatedReview = await Review.findByIdAndUpdate(
      review._id,
      { likesCount },
      { new: true }
    );

    return {
      statusCode: 200,
      body: { likesCount: updatedReview.likesCount, liked },
    };
  }

  async recalculateTargetRatings({ restaurantId, plateId = null }) {
    const restaurantStats = await Review.aggregate([
      { $match: { restaurant: restaurantId } },
      {
        $group: {
          _id: "$restaurant",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const restaurantAggregate = restaurantStats[0] ?? { averageRating: 0, totalReviews: 0 };

    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Number(restaurantAggregate.averageRating.toFixed(1)),
      totalReviews: restaurantAggregate.totalReviews,
    });

    if (!plateId) {
      return;
    }

    const plateStats = await Review.aggregate([
      { $match: { plate: plateId } },
      {
        $group: {
          _id: "$plate",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);
    const plateAggregate = plateStats[0] ?? { averageRating: 0, totalReviews: 0 };

    await Plate.findByIdAndUpdate(plateId, {
      averageRating: Number(plateAggregate.averageRating.toFixed(1)),
      totalReviews: plateAggregate.totalReviews,
    });
  }
}


module.exports = new ReviewService();
