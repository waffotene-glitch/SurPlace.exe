const asyncHandler = require("express-async-handler");
const plateService = require("../services/PlateService");
const listPlates = asyncHandler(async (req, res) => {
  const result = await plateService.listPlates(req.query);
  res.json(result);
});
const getPlateDetails = asyncHandler(async (req, res) => {
  try {
    const result = await plateService.getPlateDetails(req.params.plateId);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
