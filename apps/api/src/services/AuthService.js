const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { mapUser } = require("../utils/responseMappers");
const { assertRequiredFields, normalizeRole } = require("../utils/validators");
const { createServiceError } = require("./serviceError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;


class AuthService {
  buildAuthResponse(user) {
    return {
      token: signToken({ sub: user._id, role: user.role }),
      user: mapUser(user),
    };
  }
}