require("dotenv").config();

const mongoose = require("mongoose");
const { connectDatabase, disconnectDatabase } = require("../config/db");
const { ROLES } = require("../constants/roles");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Plate = require("../models/Plate");
const Review = require("../models/Review");
const Like = require("../models/Like");

const DEMO_PASSWORD = "Password123!";