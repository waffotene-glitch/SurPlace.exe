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
  res.status(201).json(user);
});
const login = asyncHandler(async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
throw error;
 }
});
const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user);
   res.json(result);
   });