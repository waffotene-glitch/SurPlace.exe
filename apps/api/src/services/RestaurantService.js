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

}

module.exports = new RestaurantService();