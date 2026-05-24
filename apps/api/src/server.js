const app = require("./app");
const { connectDatabase } = require("./config/db");
const { env } = require("./config/env");

const start = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

