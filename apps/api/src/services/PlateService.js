const Plate = require("../models/Plate");
const Review = require("../models/Review");
const { mapPlate } = require("../utils/responseMappers");
const { assertObjectId } = require("../utils/validators");
const { createServiceError } = require("./serviceError");


class PlateService {
  async listPlates(query = {}) {
    const filter = {};

    if (query.restaurantId) {
      assertObjectId(query.restaurantId, "restaurantId");
      filter.restaurant = query.restaurantId;
    }

    const plates = await Plate.find(filter)
      .sort({ averageRating: -1, totalReviews: -1, name: 1 })
      .limit(30);

    return { items: plates.map(mapPlate) };
  }

  async getPlateDetails(plateId) {
    const plate = await Plate.findById(plateId).populate("restaurant");

    if (!plate) {
      throw createServiceError(404, "Plate not found");
    }

    const reviews = await Review.find({ plate: plate._id })
      .populate("user", "fullName avatarUrl")
      .populate("restaurant", "_id name")
      .populate("plate", "_id name")
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      plate: mapPlate(plate),
      restaurant: {
        id: plate.restaurant._id,
        name: plate.restaurant.name,
        address: plate.restaurant.location.address,
        coverImageUrl: plate.restaurant.coverImageUrl,
      },
      reviews,
    };
  }

  async listManagedPlates(managedRestaurant) {
    const plates = await Plate.find({ restaurant: managedRestaurant._id }).sort({
      createdAt: -1,
    });

    return { items: plates.map(mapPlate) };
  }
}



module.exports = new PlateService();