const asyncHandler = require("express-async-handler");
const restaurantService = require("../services/RestaurantService");

const listRestaurants = asyncHandler(async (req, res) => {
  const result = await restaurantService.listRestaurants(req.query);
  res.json(result);
});