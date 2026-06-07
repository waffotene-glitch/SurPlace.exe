const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const plateRoutes = require("./routes/plateRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const managerRoutes = require("./routes/managerRoutes");
const swaggerSpec = require("./config/swagger");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express(); 

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/plates", plateRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/manager", managerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
