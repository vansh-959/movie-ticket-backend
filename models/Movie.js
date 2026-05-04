const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    time: { type: String, required: true },
    endTime: { type: String },
    image: { type: String },
    // Keeping old fields for compatibility
    title: { type: String },
    genre: { type: String },
    duration: { type: Number },
    rating: { type: Number, default: 0 },
    poster: { type: String },
    description: { type: String },
    releaseDate: { type: Date },
    language: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
