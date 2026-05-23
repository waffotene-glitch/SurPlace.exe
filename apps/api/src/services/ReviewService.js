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
}