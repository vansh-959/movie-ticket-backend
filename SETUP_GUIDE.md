# MongoDB Atlas Setup - Fix Authentication

## Issue
MongoDB Authentication Failed - "bad auth"

## Solution Steps

### Step 1: Whitelist Your IP Address
1. Go to https://cloud.mongodb.com/
2. Log in with your Google account
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Select "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"
7. Wait 1-2 minutes for changes

### Step 2: Verify Database User
1. Go to "Database Access"
2. Find user "vanshdeep0706_db_user"
 "Edit Password"
4. Generate and note the new password
5. In .env file, URL encode the password:
 `%40`
 `%23`
 `%3A`
   - etc.

### Step 3: Update .env File
```
MONGODB_URI=mongodb+srv://vanshdeep0706_db_user:PASSWORD_HERE@cluster0.n6g2cv7.mongodb.net/movie_booking?retryWrites=true&w=majority
PORT=3000
```

Example (if password is "pass@123"):
```
MONGODB_URI=mongodb+srv://vanshdeep0706_db_user:pass%40123@cluster0.n6g2cv7.mongodb.net/movie_booking?retryWrites=true&w=majority
PORT=3000
```

### Step 4: Test Connection
```bash
npm start
```

You should see:
```
Server running on port 3000
MongoDB Atlas Connected
```

## API Endpoints Ready

Once connected, test with:

```bash
# Add a movie
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Avatar","genre":"Sci-Fi","duration":180}'

# Get all movies
curl http://localhost:3000/api/movies
```

## Complete API List

### Movies
- GET /api/movies - List all
- POST /api/movies - Create
- GET /api/movies/:id - Get one
- PUT /api/movies/:id - Update
- DELETE /api/movies/:id - Delete

### Users
- GET /api/users - List all
- POST /api/users - Register

### Bookings
- GET /api/bookings - List all
- POST /api/bookings - Create
- GET /api/bookings/:id - Get one
- DELETE /api/bookings/:id - Cancel
