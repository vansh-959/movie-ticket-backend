const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const bookingRoutes = require('./Routes/bookingRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// API Routes
app.use('/api', bookingRoutes);

// Health check and root
app.get('/', (req, res) => {
  res.json({ message: 'Movie Booking API', status: 'OK' });
});

app.get('/health', (req, res) => {
  res.json({ health: 'OK' });
});

module.exports = app;