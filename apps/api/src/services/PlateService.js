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

  async createManagedPlate(managedRestaurant, data) {
    const {
      name,
      description = "",
      imageUrl = "",
      price = null,
      isAvailable = true,
    } = data;

    if (!name || !name.trim()) {
      throw createServiceError(400, "name is required");
    }

    const plate = await Plate.create({
      restaurant: managedRestaurant._id,
      name: name.trim(),
      description: description.trim(),
      imageUrl,
      price,
      isAvailable,
    });

    return {
      statusCode: 201,
      body: { plate: mapPlate(plate) },
    };
  }

  async updateManagedPlate(managedRestaurant, plateId, data) {
    const plate = await Plate.findOne({
      _id: plateId,
      restaurant: managedRestaurant._id,
    });

    if (!plate) {
      throw createServiceError(404, "Plate not found for this manager");
    }

    const { name, description, imageUrl, price, isAvailable } = data;

    if (name !== undefined) {
      if (!name.trim()) {
        throw createServiceError(400, "name cannot be empty");
      }

      plate.name = name.trim();
    }

    if (description !== undefined) {
      plate.description = description.trim();
    }

    if (imageUrl !== undefined) {
      plate.imageUrl = imageUrl;
    }

    if (price !== undefined) {
      plate.price = price;
    }

    if (isAvailable !== undefined) {
      plate.isAvailable = isAvailable;
    }

    await plate.save();

    return { plate: mapPlate(plate) };
  }

  async deleteManagedPlate(managedRestaurant, plateId) {
    const plate = await Plate.findOne({
      _id: plateId,
      restaurant: managedRestaurant._id,
    });

    if (!plate) {
      throw createServiceError(404, "Plate not found for this manager");
    }

    await plate.deleteOne();

    return { success: true };
  }
  
}



module.exports = new PlateService();