const mongoose = require("mongoose");
const { ROLES } = require("../constants/roles");

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

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

const normalizeEmail = (email) => {
  assertRequiredFields({ email }, ["email"]);

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    const error = new Error("Please enter a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  return normalizedEmail;
};

const normalizeFullName = (fullName) => {
  assertRequiredFields({ fullName }, ["fullName"]);

  const normalizedName = fullName.trim();

  if (normalizedName.length < 2) {
    const error = new Error("Full name must be at least 2 characters.");
    error.statusCode = 400;
    throw error;
  }

  if (!/[\p{L}]/u.test(normalizedName)) {
    const error = new Error("Full name cannot be only numbers or symbols.");
    error.statusCode = 400;
    throw error;
  }

  if (/^-/u.test(normalizedName) || /(^|\s)-/u.test(normalizedName) || /--/u.test(normalizedName)) {
    const error = new Error("Full name cannot contain negative-looking values.");
    error.statusCode = 400;
    throw error;
  }

  if (!/^[\p{L}][\p{L}' -]*$/u.test(normalizedName)) {
    const error = new Error("Full name can only include letters, spaces, hyphens, and apostrophes.");
    error.statusCode = 400;
    throw error;
  }

  return normalizedName;
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
    const error = new Error(`${fieldName} is invalid`);
    error.statusCode = 400;
    throw error;
  }
};

const assertCoordinates = (coordinates, fieldName) => {
  if (
    !coordinates ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    coordinates.some((value) => typeof value !== "number" || Number.isNaN(value))
  ) {
    const error = new Error(`${fieldName} must be [lng, lat]`);
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  assertRequiredFields,
  normalizeEmail,
  normalizeFullName,
  normalizeRole,
  assertObjectId,
  assertCoordinates,
};

