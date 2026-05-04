const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String }, // Flexible: could be ObjectId or string ID
    name: { type: String, required: true },
    fatherName: { type: String },
    movie: { type: String, required: true }, // Store movie name as string for simplicity
    seats: [{ type: Number, required: true }],
    time: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    cancelDate: { type: Date },
    // Keeping old fields for compatibility
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    showTime: { type: Date },
    totalPrice: { type: Number },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
