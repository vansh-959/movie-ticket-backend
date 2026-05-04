# MongoDB Atlas Setup Guide

## Current Status
 Mongoose installed
 Models created (Movie, Booking, User)
 Server configured
 Authentication issue - need to fix password/IP

## To Fix Authentication Error:

### Option 1: Whitelist Your IP
1. Go to: https://cloud.mongodb.com/
2. Click "Network Access" (left sidebar)
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

### Option 2: Reset Password
1. Go to: https://cloud.mongodb.com/
2. Click "Database Access" (left sidebar)
3. Find user "vanshdeep0706_db_user"
 "Edit Password"
5. Generate new password
6. Update the .env file with the new password (URL encode special chars)
7. URL encode the password:
 `%40`
 `%23`
   - etc.

### Example Connection String
```
mongodb+srv://vanshdeep0706_db_user:PASSWORD@cluster0.n6g2cv7.mongodb.net/?appName=Cluster0
```

## API Endpoints (Once Connected)

### Movies
- GET /api/movies - Get all movies
- POST /api/movies - Add movie
- DELETE /api/movies/:id - Delete movie

### Bookings
- GET /api/bookings - Get all bookings
- POST /api/bookings - Create booking

### Users
- POST /api/users - Register user

## Test With curl
```bash
# Add a movie
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Avatar","genre":"Sci-Fi","duration":180}'

# Get all movies
curl http://localhost:3000/api/movies
```
