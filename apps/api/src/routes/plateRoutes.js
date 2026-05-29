const express = require("express");
const { getPlateDetails, listPlates } = require("../controllers/plateController");

const router = express.Router();

router.get("/", listPlates);
router.get("/:plateId", getPlateDetails);

module.exports = router;
