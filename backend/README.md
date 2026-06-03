# Altas Dental Center - Backend API

A production-ready Node.js/Express backend for the Altas Dental Center with JWT-based authentication.

## Features

- ✅ Admin-only authentication (no public signup)
- ✅ JWT-based token authentication
- ✅ Secure password hashing with bcrypt
- ✅ MongoDB integration with Mongoose
- ✅ Protected routes for dashboard and profile
- ✅ CORS enabled for frontend
- ✅ Comprehensive error handling
- ✅ Seed script for admin creation

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Create `.env` file in the backend directory:**

```bash
cp .env.example .env
```

3. **Configure your `.env` file with:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/altas-dental?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Running the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

## Seeding Admin User

To create the initial admin user:

```bash
npm run seed
```

This will create an admin with:
- Email: `admin@altasdental.com`
- Password: `AdminPassword123`

**Important:** Change the password immediately after first login.

## API Endpoints

### Authentication Routes

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "admin@altasdental.com",
    "password": "AdminPassword123"
  }
  ```
- **Response:** Returns JWT token and admin data

#### Signup (Manual admin creation)
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "email": "newadmin@altasdental.com",
    "password": "SecurePassword123",
    "firstName": "Admin",
    "lastName": "Name"
  }
  ```
- **Response:** Returns JWT token and admin data

#### Get Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Returns admin profile information

#### Get Dashboard (Protected)
- **GET** `/api/auth/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Returns dashboard data

#### Logout (Protected)
- **GET** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Clears authentication token

## Project Structure

```
backend/
├── config/
│   ├── database.js        # MongoDB connection
│   └── jwt.js             # JWT configuration
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── auth.js            # JWT verification middleware
├── models/
│   └── Admin.js           # Admin schema
├── routes/
│   └── authRoutes.js      # Auth routes
├── utils/
│   ├── tokenUtils.js      # JWT utilities
│   └── errorHandler.js    # Error handling
├── scripts/
│   └── seedAdmin.js       # Admin seeding script
├── server.js              # Main server file
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## Testing with Postman

1. **Login:**
   - POST to `http://localhost:5000/api/auth/login`
   - Body (JSON): `{ "email": "admin@altasdental.com", "password": "AdminPassword123" }`
   - Copy the returned `token`

2. **Access Protected Routes:**
   - Add header: `Authorization: Bearer <your_token>`
   - GET `http://localhost:5000/api/auth/profile`

## Security Notes

- Always use strong, unique JWT secrets in production
- Store sensitive data in environment variables
- Use HTTPS in production
- Implement rate limiting for login attempts
- Regularly update dependencies
- Change default admin password after setup

## Troubleshooting

- **MongoDB Connection Error:** Ensure your connection string is correct and MongoDB Atlas allows your IP
- **CORS Issues:** Check that FRONTEND_URL matches your frontend URL
- **JWT Token Expired:** Refresh tokens or re-login
- **Invalid Credentials:** Verify email and password are correct

## License

ISC
