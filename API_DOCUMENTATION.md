# Movie Booking API - Complete Documentation

## Project Structure
```
movie-backend/
 config/
 db.js (MongoDB connection)   
 models/
 Movie.js   
 User.js   
 Booking.js   
 server.js (Express server)
 package.json
 .env (MongoDB credentials)
```

## Database Schema

### Movie
```javascript
{
  _id: ObjectId,
  title: String (required),
  genre: String (required),
  duration: Number (required),
  rating: Number (default: 0),
  poster: String,
  description: String,
  releaseDate: Date,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  password: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  movieId: ObjectId (ref: Movie, required),
  seats: [String] (required),
  showTime: Date (required),
  totalPrice: Number (required),
  status: String (enum: ["confirmed", "cancelled"], default: "confirmed"),
  createdAt: Date,
  updatedAt: Date
}
```

## REST API Endpoints

### Movies
```
GET    /api/movies          - List all movies
POST   /api/movies          - Create movie
GET    /api/movies/:id      - Get movie by ID
PUT    /api/movies/:id      - Update movie
DELETE /api/movies/:id      - Delete movie
```

### Users
```
GET    /api/users           - List all users (no passwords)
POST   /api/users           - Register new user
```

### Bookings
```
GET    /api/bookings        - List all bookings (with movie & user details)
POST   /api/bookings        - Create booking
GET    /api/bookings/:id    - Get booking by ID
DELETE /api/bookings/:id    - Cancel booking (sets status to "cancelled")
```

## Example Requests

### Add Movie
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "genre": "Sci-Fi",
    "duration": 148,
    "rating": 8.8,
    "description": "A mind-bending thriller",
    "language": "English"
  }'
```

### Get All Movies
```bash
curl http://localhost:3000/api/movies
```

### Register User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "securePassword123"
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "movieId": "MOVIE_ID_HERE",
    "seats": ["A1", "A2"],
    "showTime": "2026-05-05T18:00:00Z",
    "totalPrice": 500
  }'
```

### Get All Bookings
```bash
curl http://localhost:3000/api/bookings
```

### Cancel Booking
```bash
curl -X DELETE http://localhost:3000/api/bookings/BOOKING_ID
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Running the Server

```bash
npm start
```

Server runs on: `http://localhost:3000`

Database: MongoDB Atlas (movie_booking)
