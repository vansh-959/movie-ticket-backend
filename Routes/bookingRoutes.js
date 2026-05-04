const express = require("express");
const router = express.Router();

const {
    signupUser,
    loginUser,
    getUserBookings,
    lockSeat,
    unlockSeat,
    bookSeat,
    cancelBooking,
    getBookings,
    getMovies,
    addMovie,
    deleteMovie,
    loginAdmin,
    getUsers,
    getSecurityQuestion,
    forgotPassword
} = require("../controllers/bookingController");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_123";

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
};

// User routes
router.post("/users/signup", signupUser);
router.post("/users/login", loginUser);
router.get("/user-bookings/:userId", verifyToken, getUserBookings);
router.get("/users", getUsers);
router.post("/users/forgot-password", forgotPassword);
router.post("/users/get-security-question", getSecurityQuestion);

// Seat Locking routes (keep open for better UX, or protect if needed)
router.post("/lock-seat", lockSeat);
router.post("/unlock-seat", unlockSeat);

// Booking routes
router.post("/book", verifyToken, bookSeat);
router.get("/bookings", getBookings);
router.delete("/bookings/:id", (req, res, next) => {
    // Skip verifyToken if it's an admin request
    if (req.body && req.body.isAdmin === true) return next();
    verifyToken(req, res, next);
}, cancelBooking);

// Movie routes
router.get("/movies", getMovies);
router.post("/movies", addMovie);
router.delete("/movies/:name", deleteMovie);

// Admin routes
router.post("/login", loginAdmin);

module.exports = router;