const Plate = require("../models/Plate");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const { mapPlate, mapRestaurant } = require("../utils/responseMappers");
const { createServiceError } = require("./serviceError");

class RestaurantService {
  async listRestaurants(query = {}) {
    const { q } = query;
    const filter = q
      ? {
          name: {
            $regex: q.trim(),
            $options: "i",
          },
        }
      : {};

    const restaurants = await Restaurant.find(filter)
      .sort({ averageRating: -1, totalReviews: -1, createdAt: -1 })
      .limit(20);

    return { items: restaurants.map(mapRestaurant) };
  }

  async getRestaurantDetails(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      throw createServiceError(404, "Restaurant not found");
    }

    const [plates, recentReviews] = await Promise.all([
      Plate.find({ restaurant: restaurant._id }).sort({ averageRating: -1, name: 1 }),
      Review.find({ restaurant: restaurant._id })
        .populate("user", "fullName avatarUrl")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return {
      restaurant: mapRestaurant(restaurant),
      plates: plates.map(mapPlate),
      recentReviews,
    };
  }

  async getManagerRestaurant(managedRestaurant) {
    if (!managedRestaurant) {
      throw createServiceError(404, "Manager restaurant not found");
    }

    return { restaurant: mapRestaurant(managedRestaurant) };
  }

  validateRestaurantPayload(data) {
    const { name, location } = data;

    if (!name || !name.trim()) {
      throw createServiceError(400, "name is required");
    }

    if (!location || !location.address || !location.coordinates) {
      throw createServiceError(400, "location with address and coordinates is required");
    }

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((value) => typeof value !== "number")
    ) {
      throw createServiceError(400, "location.coordinates must be [lng, lat]");
    }
  }

}

module.exports = new RestaurantService();