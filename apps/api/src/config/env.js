const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  reviewVerificationRadiusMeters: Number(
    process.env.REVIEW_VERIFICATION_RADIUS_METERS || 200
  ),
  enforceLocationVerification:
    String(process.env.ENFORCE_LOCATION_VERIFICATION || "false").toLowerCase() === "true",
};

module.exports = { env };
