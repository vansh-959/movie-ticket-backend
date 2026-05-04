const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Movie = require("../models/Movie");
const User = require("../models/User");
const Booking = require("../models/Booking");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_123";

// Structure of locks: { movie: string, seat: number, expiresAt: number, sessionId: string }
let lockedSeats = []; 

// Clean up expired locks automatically
const cleanupLocks = () => {
    const now = Date.now();
    lockedSeats = lockedSeats.filter(lock => lock.expiresAt > now);
};

// ========================
// USER AUTHENTICATION
// ========================
const signupUser = async (req, res) => {
    try {
        const { name, email, password, securityQuestion, securityAnswer } = req.body;
        if (!name || !email || !password || !securityQuestion || !securityAnswer) return res.status(400).json({ message: "All fields required" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), salt);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword,
            securityQuestion,
            securityAnswer: hashedAnswer
        });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ 
            message: "Signup successful", 
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        let isMatch = await bcrypt.compare(password, user.password);
        
        // Fallback for plain-text passwords (migration)
        if (!isMatch && password === user.password) {
            isMatch = true;
            // Auto-migrate to hashed password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
        }

        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ 
            message: "Login successful", 
            token,
            user: { id: user._id, name: user.name, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const userBookings = await Booking.find({ userId });
        res.json({ bookings: userBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Searching security question for:", email);
        if (!email) return res.status(400).json({ message: "Email required" });

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(404).json({ message: "No account found with this email" });
        }

        if (!user.securityQuestion) {
            console.log("Security question missing for:", email);
            return res.status(400).json({ message: "Security recovery is not set up for this old account. Please create a new account with security details." });
        }

        console.log("Question found:", user.securityQuestion);
        res.json({ question: user.securityQuestion });
    } catch (error) {
        console.error("Error in getSecurityQuestion:", error);
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;
        if (!email || !securityAnswer || !newPassword) return res.status(400).json({ message: "All fields required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found" });

        const isMatch = await bcrypt.compare(securityAnswer.toLowerCase(), user.securityAnswer);
        if (!isMatch) return res.status(401).json({ message: "Incorrect security answer" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Password updated successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================
// SEAT LOCKING
// ========================
const lockSeat = async (req, res) => {
    cleanupLocks();
    const { movie, seat, sessionId } = req.body;
    
    try {
        // Check if permanently booked
        const existingBooking = await Booking.findOne({ 
            movie, 
            status: 'active', 
            seats: seat 
        });
        
        if (existingBooking) {
            return res.status(400).json({ message: "Seat already booked" });
        }
        
        // Check if locked by someone else
        const existingLock = lockedSeats.find(l => l.movie === movie && l.seat === seat);
        if (existingLock && existingLock.sessionId !== sessionId) {
            return res.status(400).json({ message: "Seat is temporarily reserved by someone else" });
        }
        
        if (!existingLock) {
            lockedSeats.push({
                movie,
                seat,
                sessionId,
                expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
            });
        } else {
            // renew lock
            existingLock.expiresAt = Date.now() + 5 * 60 * 1000;
        }
        
        res.status(200).json({ message: "Seat locked" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unlockSeat = (req, res) => {
    const { movie, seat, sessionId } = req.body;
    lockedSeats = lockedSeats.filter(l => !(l.movie === movie && l.seat === seat && l.sessionId === sessionId));
    res.status(200).json({ message: "Seat unlocked" });
};

// ========================
// BOOKINGS
// ========================
const bookSeat = async (req, res) => {
    cleanupLocks();
    const { userId, name, fatherName, movie, seats, time, sessionId } = req.body;

    if (!userId || !name || !fatherName || !movie || !seats || seats.length === 0) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        // Check if seat already booked for same movie
        const alreadyBooked = await Booking.findOne({
            movie,
            status: 'active',
            seats: { $in: seats }
        });

        if (alreadyBooked) {
            return res.status(400).json({ message: "Some seats already booked" });
        }
        
        // Check if seats are locked by someone ELSE
        for (let seat of seats) {
            const lock = lockedSeats.find(l => l.movie === movie && l.seat === seat);
            if (lock && lock.sessionId !== sessionId) {
                return res.status(400).json({ message: `Seat ${seat} is reserved by someone else` });
            }
        }

        // Save booking
        const newBooking = new Booking({
            userId,
            name,
            fatherName,
            movie,
            seats,
            time,
            status: 'active'
        });

        await newBooking.save();
        
        // Remove locks for these seats
        lockedSeats = lockedSeats.filter(l => !(l.movie === movie && seats.includes(l.seat)));

        res.status(200).json({
            message: "Booking successful",
            data: newBooking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const { fatherName, isAdmin, adminPassword } = req.body;
    const authUserId = req.userId; // Will be undefined if from admin (if middleware skipped)

    try {
        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        // 1. ADMIN CASE
        if (isAdmin === true) {
            if (adminPassword !== "admin123") {
                return res.status(401).json({ message: "Invalid Admin Password" });
            }
            // Admin authorized
        } 
        // 2. USER CASE
        else if (booking.userId) {
            if (!authUserId || booking.userId.toString() !== authUserId.toString()) {
                return res.status(401).json({ message: "Unauthorized cancellation" });
            }
        } 
        // 3. FALLBACK (Old system)
        else if (fatherName) {
            if (booking.fatherName.toLowerCase() !== fatherName.toLowerCase()) {
                return res.status(401).json({ message: "Incorrect Father's Name" });
            }
        } else {
            return res.status(400).json({ message: "Authentication required for cancellation" });
        }

        // Calculate Refund
        let refundPercent = 0;
        const now = new Date();
        const movieTime = new Date(booking.time);
        const diffHours = (movieTime - now) / (1000 * 60 * 60);

        if (diffHours >= 24) refundPercent = 90;
        else if (diffHours >= 12) refundPercent = 70;
        else if (diffHours >= 6) refundPercent = 50;
        else refundPercent = 0;

        // Try to get price from movie if totalPrice is missing
        let totalVal = booking.totalPrice || 0;
        if (!totalVal) {
            const movieInfo = await Movie.findOne({ name: booking.movie });
            if (movieInfo) totalVal = movieInfo.price * booking.seats.length;
        }

        const refundAmount = Math.floor((totalVal * refundPercent) / 100);
        
        booking.status = 'cancelled';
        booking.cancelDate = now;
        booking.refundAmount = refundAmount;
        await booking.save();

        res.json({ 
            message: "Booking cancelled successfully", 
            refundAmount, 
            refundPercent,
            totalPrice: totalVal 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookings = async (req, res) => {
    cleanupLocks();
    try {
        const bookings = await Booking.find();
        res.status(200).json({
            bookings,
            lockedSeats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================
// MOVIES
// ========================
const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addMovie = async (req, res) => {
    try {
        const { name, category, price, time, endTime, image } = req.body;
        if (!name || !category || !price || !time) return res.status(400).json({ message: "All fields required" });
        
        const newMovie = new Movie({ 
            name, 
            category, 
            price, 
            time, 
            endTime,
            image: image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop" 
        });
        await newMovie.save();
        
        res.json({ message: "Movie added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { name } = req.params;
        await Movie.deleteOne({ name });
        res.json({ message: "Movie deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================
// ADMIN
// ========================
const loginAdmin = (req, res) => {
    const { password } = req.body;
    if (password === "admin123") return res.json({ success: true, message: "Logged in" });
    return res.status(401).json({ success: false, message: "Invalid password" });
};

module.exports = {
    signupUser,
    loginUser,
    getUserBookings,
    getUsers,
    getSecurityQuestion,
    forgotPassword,
    lockSeat,
    unlockSeat,
    bookSeat,
    cancelBooking,
    getBookings,
    getMovies,
    addMovie,
    deleteMovie,
    loginAdmin
};