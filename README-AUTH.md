# NariNiti - Authentication System

A complete authentication system for the NariNiti website with both frontend and backend components.

## Features

- **Frontend:**
  - Responsive login/signup page with blue theme
  - Toggle between login and signup forms
  - Form validation
  - Success/error message display
  - Authentication state management
  - Protected features (Talk to Lakshmi requires login)

- **Backend:**
  - RESTful API with Express.js
  - SQLite database for user storage
  - Password hashing with bcrypt
  - JWT token-based authentication
  - CORS enabled for frontend communication

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env` file is already created with default values. For production, change the `JWT_SECRET` to a secure random string.

### 3. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### POST `/api/register`
Register a new user
- **Body:** `{ "name": "string", "email": "string", "password": "string" }`
- **Response:** `{ "message": "string", "token": "string", "user": {...} }`

### POST `/api/login`
Login an existing user
- **Body:** `{ "email": "string", "password": "string" }`
- **Response:** `{ "message": "string", "token": "string", "user": {...} }`

### GET `/api/profile`
Get user profile (requires authentication)
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ "user": {...} }`

## File Structure

```
├── server.js          # Express server with authentication API
├── package.json       # Node.js dependencies
├── .env              # Environment variables
├── index.html        # Main homepage
├── login.html        # Login/Signup page
├── index.css         # Styles for main page
├── index.js          # Frontend JavaScript
└── users.db          # SQLite database (created automatically)
```

## Usage

1. **Registration:** New users can create an account with name, email, and password
2. **Login:** Existing users can log in with email and password
3. **Authentication:** JWT tokens are stored in localStorage for session management
4. **Protected Features:** Some features require authentication (e.g., "Talk to Lakshmi")
5. **Logout:** Users can logout by clicking on their name in the header

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Protected routes
- CORS configuration

## Database

The application uses SQLite for simplicity. The database file (`users.db`) is created automatically when the server starts. For production, consider using PostgreSQL or MongoDB.

## Future Enhancements

- Email verification
- Password reset functionality
- Role-based access control
- Social login integration
- Account settings page
- Two-factor authentication
