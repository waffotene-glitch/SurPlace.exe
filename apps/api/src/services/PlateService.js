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
}



module.exports = new PlateService();