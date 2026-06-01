const asyncHandler = require("express-async-handler");
const reviewService = require("../services/ReviewService");

const listFeed = asyncHandler(async (_req, res) => {
  const result = await reviewService.listFeed();
  res.json(result);
});