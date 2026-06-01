const asyncHandler = require("express-async-handler");
const plateService = require("../services/PlateService");
const listPlates = asyncHandler(async (req, res) => {
  const result = await plateService.listPlates(req.query);
  res.json(result);
});