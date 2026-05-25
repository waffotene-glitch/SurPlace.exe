const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    managedRestaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: undefined,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);