const express = require("express");
const { login, me, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();