const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/Restaurant");

const loadManagedRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findOne({ manager: req.user._id });

  req.managedRestaurant = restaurant || null;
  next();
});

const requireManagedRestaurant = (req, res, next) => {
  if (!req.managedRestaurant) {
    res.status(404);
    throw new Error("Manager restaurant not found");
  }

  next();
};

module.exports = {
  loadManagedRestaurant,
  requireManagedRestaurant,
};
