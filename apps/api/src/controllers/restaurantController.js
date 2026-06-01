const asyncHandler = require("express-async-handler");
const restaurantService = require("../services/RestaurantService");

const listRestaurants = asyncHandler(async (req, res) => {
  const result = await restaurantService.listRestaurants(req.query);
  res.json(result);
});
const getRestaurantDetails = asyncHandler(async (req, res) => {
  try {
    const result = await restaurantService.getRestaurantDetails(req.params.restaurantId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    throw error;
  }
});

const getManagerRestaurant = asyncHandler(async (req, res) => {
  try {
    const result = await restaurantService.getManagerRestaurant(req.managedRestaurant);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }