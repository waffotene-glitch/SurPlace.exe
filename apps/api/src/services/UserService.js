const { mapUser } = require("../utils/responseMappers");

class UserService {
  async getProfile(user) {
    return { user: mapUser(user) };
  }
}

module.exports = new UserService();
