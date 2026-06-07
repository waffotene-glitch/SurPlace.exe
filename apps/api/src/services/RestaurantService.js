const Plate = require("../models/Plate");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const { mapPlate, mapRestaurant } = require("../utils/responseMappers");
const { assertObjectId } = require("../utils/validators");
const { createServiceError } = require("./serviceError");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    assertObjectId(restaurantId, "restaurantId");

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

    if (!location || !location.address || !location.address.trim() || !location.coordinates) {
      throw createServiceError(400, "location with address and coordinates is required");
    }

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((value) => typeof value !== "number" || !Number.isFinite(value))
    ) {
      throw createServiceError(400, "location.coordinates must be [lng, lat]");
    }
  }
  
  buildRestaurantUpdate(data, managerId) {
    const {
      name,
      description = "",
      coverImageUrl = "",
      cuisineTags = [],
      location,
    } = data;

    return {
      manager: managerId,
      name: name.trim(),
      description: description.trim(),
      coverImageUrl,
      cuisineTags,
      location: {
        address: location.address.trim(),
        coordinates: {
          type: "Point",
          coordinates: location.coordinates,
        },
      },
    };
  }

  async assertUniqueManagerRestaurantName({ managerId, name, restaurantId }) {
    const filter = {
      manager: managerId,
      name: {
        $regex: `^${escapeRegex(name.trim())}$`,
        $options: "i",
      },
    };

    if (restaurantId) {
      filter._id = { $ne: restaurantId };
    }

    const duplicateRestaurant = await Restaurant.findOne(filter).select("_id").lean();

    if (duplicateRestaurant) {
      throw createServiceError(400, "You already have a restaurant with this name.");
    }
  }

  async upsertManagedRestaurant({ managedRestaurant, user, data }) {
    this.validateRestaurantPayload(data);
    const restaurantUpdate = this.buildRestaurantUpdate(data, user._id);
    await this.assertUniqueManagerRestaurantName({
      managerId: user._id,
      name: restaurantUpdate.name,
      restaurantId: managedRestaurant?._id,
    });

    if (!managedRestaurant) {
      const restaurant = await Restaurant.create(restaurantUpdate);

      user.managedRestaurant = restaurant._id;
      await user.save();

      return {
        statusCode: 201,
        body: { restaurant: mapRestaurant(restaurant) },
      };
    }

    managedRestaurant.name = restaurantUpdate.name;
    managedRestaurant.description = restaurantUpdate.description;
    managedRestaurant.coverImageUrl = restaurantUpdate.coverImageUrl;
    managedRestaurant.cuisineTags = restaurantUpdate.cuisineTags;
    managedRestaurant.location = restaurantUpdate.location;

    await managedRestaurant.save();

    return {
      statusCode: 200,
      body: { restaurant: mapRestaurant(managedRestaurant) },
    };
  }
}

module.exports = new RestaurantService();
