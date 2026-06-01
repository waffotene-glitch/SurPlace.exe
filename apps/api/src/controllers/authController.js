const asyncHandler = require("express-async-handler");
const authService = require("../services/AuthService");
const register = asyncHandler(async (req, res) => {
  let user;
  try {
    user = await authService.register(req.body);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    throw error;
  }