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
throw error;
  }
});
const listManagedPlates = asyncHandler(async (req, res) => {
  const result = await plateService.listManagedPlates(req.managedRestaurant);
  res.json(result);
});
const createManagedPlate = asyncHandler(async (req, res) => {
  try {
    const result = await plateService.createManagedPlate(req.managedRestaurant, req.body);
    res.status(result.statusCode).json(result.body);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
throw error;
  }
});
const updateManagedPlate = asyncHandler(async (req, res) => {
  try {
    const result = await plateService.updateManagedPlate(
      req.managedRestaurant,
      req.params.plateId,
      req.body
    );
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }

    throw error;
  }
});