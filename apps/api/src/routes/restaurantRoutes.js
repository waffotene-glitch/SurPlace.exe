const express = require("express");
const {
  getRestaurantDetails,
  listRestaurants,
} = require("../controllers/restaurantController");

const router = express.Router();

router.get("/", listRestaurants);
router.get("/:restaurantId", getRestaurantDetails);

module.exports = router;
