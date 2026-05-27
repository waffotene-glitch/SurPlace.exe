const mongoose = require("mongoose");
const { env } = require("./env");

const connectDatabase = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(env.mongodbUri);
  console.log("MongoDB connected");
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDatabase, disconnectDatabase };
//