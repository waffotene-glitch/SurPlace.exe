const express = require("express");
const { createReview, likeReview, listFeed } = require("../controllers/reviewController");
const { ROLES } = require("../constants/roles");
const { authorize, protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/feed", listFeed);
router.post("/", protect, authorize(ROLES.USER), createReview);
router.post("/:reviewId/like", protect, authorize(ROLES.USER, ROLES.MANAGER), likeReview);

module.exports = router;

