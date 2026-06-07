const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { mapUser } = require("../utils/responseMappers");
const {
  assertRequiredFields,
  normalizeEmail,
  normalizeFullName,
  normalizeRole,
} = require("../utils/validators");
const { createServiceError } = require("./serviceError");

const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;

class AuthService {
  buildAuthResponse(user) {
    return {
      token: signToken({ sub: user._id, role: user.role }),
      user: mapUser(user),
    };
  }

  async register(data) {
    const { fullName, email, password } = data;
    const role = normalizeRole(data.role);

    assertRequiredFields({ fullName, email, password }, ["fullName", "email", "password"]);

    const normalizedFullName = normalizeFullName(fullName);
    const normalizedEmail = normalizeEmail(email);

    if (password.length < 4) {
      throw createServiceError(400, "Password must be at least 4 characters.");
    }

    if (!PASSWORD_LETTER_PATTERN.test(password) || !PASSWORD_NUMBER_PATTERN.test(password)) {
      throw createServiceError(400, "Password must include at least one letter and one number.");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw createServiceError(409, "An account with this email already exists.");
    }

    let user;
    try {
      user = await User.create({
        fullName: normalizedFullName,
        email: normalizedEmail,
        password,
        role,
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw createServiceError(409, "An account with this email already exists.");
      }

      throw error;
    }

    return this.buildAuthResponse(user);
  }

  async login(data) {
    const { email, password } = data;

    assertRequiredFields({ email, password }, ["email", "password"]);

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw createServiceError(401, "Invalid credentials");
    }

    return this.buildAuthResponse(user);
  }

  async getMe(user) {
    return { user: mapUser(user) };
  }
}

module.exports = new AuthService();
