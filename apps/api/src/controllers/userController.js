const asyncHandler = require("express-async-handler");
const userService = require("../services/UserService");
const getProfile = asyncHandler(async (req, res) => {
  const result = await userService.getProfile(req.user);
  res.json(result);
});
module.exports = { getProfile };

