const mongoose = require("mongoose");

const reviewMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["camera"],
      default: "camera",
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    plate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plate",
      default: null,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["restaurant", "plate"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    media: {
      type: [reviewMediaSchema],
      default: [],
    },
    verification: {
      submittedCoordinates: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
      },
      distanceMeters: {
        type: Number,
        default: null,
      },
      radiusMeters: {
        type: Number,
        default: null,
      },
      isVerifiedOnSite: {
        type: Boolean,
        default: false,
      },
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.pre("validate", function validateTarget(next) {
  const hasPlate = Boolean(this.plate);

  if (this.targetType === "plate" && !hasPlate) {
    return next(new Error("Plate reviews must include a plate"));
  }

  if (this.targetType === "restaurant" && hasPlate) {
    return next(new Error("Restaurant reviews cannot include a plate"));
  }

  next();
});

module.exports = mongoose.model("Review", reviewSchema);