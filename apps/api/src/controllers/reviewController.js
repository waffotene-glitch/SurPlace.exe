const asyncHandler = require("express-async-handler");
const reviewService = require("../services/ReviewService");

const listFeed = asyncHandler(async (_req, res) => {
  const result = await reviewService.listFeed();
  res.json(result);
});

const createReview = asyncHandler(async (req, res) => {
  try {
    const result = await reviewService.createReview({
      user: req.user,
      data: req.body,
    });
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }

    throw error;
  }
});

const likeReview = asyncHandler(async (req, res) => {
  try {
    const result = await reviewService.likeReview({
      userId: req.user._id,
      reviewId: req.params.reviewId,
    });
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }

    throw error;
  }
});

module.exports = { listFeed, createReview, likeReview };
