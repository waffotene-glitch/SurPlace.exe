const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const plateRoutes = require("./routes/plateRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const managerRoutes = require("./routes/managerRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express(); 