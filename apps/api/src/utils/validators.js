const mongoose = require("mongoose");
const { ROLES } = require("../constants/roles");

const assertRequiredFields = (payload, fields) => {
  for (const field of fields) {
    const value = payload[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      throw new Error(`${field} is required`);
    }
  }
};

const normalizeRole = (role) => {
  if (!role) {
    return ROLES.USER;
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new Error("Invalid role");
  }

  return role;
};

const assertObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`${fieldName} is invalid`);
  }
};

const assertCoordinates = (coordinates, fieldName) => {
  if (
    !coordinates ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    coordinates.some((value) => typeof value !== "number" || Number.isNaN(value))
  ) {
    throw new Error(`${fieldName} must be [lng, lat]`);
  }
};

module.exports = {
  assertRequiredFields,
  normalizeRole,
  assertObjectId,
  assertCoordinates,
};

