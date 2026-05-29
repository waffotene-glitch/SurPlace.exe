const express = require("express");
const { ROLES } = require("../constants/roles");
const { authorize, protect } = require("../middleware/authMiddleware");
const { loadManagedRestaurant, requireManagedRestaurant } = require("../middleware/managerMiddleware");
const {
  getDashboard,
  listManagerReviews,
} = require("../controllers/managerController");
const {
  getManagerRestaurant,
  upsertManagedRestaurant,
} = require("../controllers/restaurantController");
const {
  createManagedPlate,
  deleteManagedPlate,
  listManagedPlates,
  updateManagedPlate,
} = require("../controllers/plateController");

const router = express.Router();

router.use(protect, authorize(ROLES.MANAGER), loadManagedRestaurant);

router.get("/dashboard", getDashboard);
router.get("/restaurant", getManagerRestaurant);
router.post("/restaurant", upsertManagedRestaurant);
router.put("/restaurant", upsertManagedRestaurant);

router.get("/plates", requireManagedRestaurant, listManagedPlates);
router.post("/plates", requireManagedRestaurant, createManagedPlate);
router.put("/plates/:plateId", requireManagedRestaurant, updateManagedPlate);
router.delete("/plates/:plateId", requireManagedRestaurant, deleteManagedPlate);
router.get("/reviews", requireManagedRestaurant, listManagerReviews);

module.exports = router;
