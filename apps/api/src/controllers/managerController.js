const asyncHandler = require("express-async-handler");
const managerService = require("../services/ManagerService");




const getDashboard = asyncHandler(async (req, res) => {
  const result = await managerService.getDashboard(req.managedRestaurant);
  res.json(result);
});




const listManagerReviews = asyncHandler(async (req, res) => {
  const result = await managerService.listManagerReviews(req.managedRestaurant);
  res.json(result);
});
 


module.exports = {
  getDashboard,
  listManagerReviews,
};
 
