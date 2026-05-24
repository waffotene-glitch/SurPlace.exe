const Plate = require("../models/Plate");
const Review = require("../models/Review");
const { mapPlate, mapRestaurant } = require("../utils/responseMappers");

class ManagerService {
  async getDashboard(managedRestaurant) {
    if (!managedRestaurant) {
      return {
        restaurant: null,
        averageRating: 0,
        recentReviews: [],
        plates: [],
      };
    }
     const [recentReviews, plates] = await Promise.all([
      Review.find({ restaurant: managedRestaurant._id })
        .populate("user", "fullName avatarUrl")
        .populate("restaurant", "_id name")
        .populate("plate", "name")
        .sort({ createdAt: -1 })
        .limit(10),
      Plate.find({ restaurant: managedRestaurant._id }).sort({ averageRating: -1, name: 1 }),
    ]);

    return {
      restaurant: mapRestaurant(managedRestaurant),
      averageRating: managedRestaurant.averageRating,
      recentReviews,
      plates: plates.map(mapPlate),
    };
  }
}


module.exports = new ManagerService();