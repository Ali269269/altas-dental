# Altas Dental Center - Complete Authentication System Guide

## Overview

This document provides complete setup and integration instructions for the authentication system implemented for the Altas Dental Center project. The system includes:

- **Backend**: Node.js/Express server with MongoDB and JWT authentication
- **Frontend**: React/Next.js integration with login modal and protected dashboard
- **Admin-Only Access**: No public signup; only predefined admin can log in

## Architecture

```
┌─────────────────────┐
│   Frontend (Next.js)  │
│  - Header Component   │
│  - Login Modal        │
│  - Protected Dashboard│
└──────────┬────────────┘
           │ API Calls
           │ (HTTP/REST)
           ▼
┌─────────────────────┐
│ Backend (Express.js) │
│ - Auth Routes       │
│ - JWT Middleware    │
│ - Admin Model       │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────┐
│  MongoDB Atlas      │
│  - Admin Collection │
└─────────────────────┘
```

## Backend Setup

### 1. Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB Atlas account
- A terminal/command line

### 2. Installation

Navigate to the backend directory:

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory by copying the `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# MongoDB Connection - Replace with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/altas-dental?retryWrites=true&w=majority

# JWT Secret - Use a strong, random string
JWT_SECRET=your_very_secure_jwt_secret_key_change_in_production_123!@#

# Token expiration
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

**Important**: Replace `username:password` and `cluster0` with your actual MongoDB Atlas credentials.

### 4. Create Admin User

Run the seed script to create the initial admin:

```bash
npm run seed
```

This creates an admin with:
- **Email**: `admin@altasdental.com`
- **Password**: `AdminPassword123`

⚠️ **Change this password immediately after first login!**

### 5. Start Backend Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server should start on `http://localhost:5000`

Verify it's running:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is running"
}
```

## Frontend Setup

### 1. Install Dependencies

The frontend uses existing Next.js setup. Ensure all dependencies are installed:

```bash
npm install
```

### 2. Add Required Utilities

The following files have been created/updated:

- `utils/auth.ts` - Authentication utilities
- `components/LoginModal.tsx` - Login modal component
- `context/AuthContext.tsx` - Auth context provider (optional)
- `components/Header.tsx` - Updated with Account button and login modal

### 3. Update App Layout (Optional but Recommended)

For better auth state management across the app, update `app/layout.tsx`:

```tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## User Flow

### Step-by-Step: Admin Login

1. **Open Application** → Visit `http://localhost:3000`
2. **Click Account Button** → Click the "Account" button in the header
3. **Login Modal Opens** → Enter credentials:
   - Email: `admin@altasdental.com`
   - Password: `AdminPassword123`
4. **Submit Form** → Click "Login" button
5. **Redirect to Dashboard** → Auto-redirected to `/dashboard` upon success
6. **View Profile** → Dashboard displays admin information
7. **Logout** → Click "Logout" button to exit

### Dashboard Features

The admin dashboard displays:

- **Admin Profile Information** (Email, Name, Account Created Date)
- **Last Login Timestamp**
- **Dashboard Statistics** (Extensible for future features)
- **Logout Button**

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 1. Login

**POST** `/auth/login`

**Public Route** - No authentication required

**Request Body**:

```json
{
  "email": "admin@altasdental.com",
  "password": "AdminPassword123"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "user_id_here",
    "email": "admin@altasdental.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

**Error Response** (401 Unauthorized):

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 2. Signup (Admin Creation)

**POST** `/auth/signup`

**Public Route** - Use this endpoint to manually create additional admins via Postman/API tools

**Request Body**:

```json
{
  "email": "newadmin@altasdental.com",
  "password": "SecurePassword123",
  "firstName": "New",
  "lastName": "Admin"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "user_id_here",
    "email": "newadmin@altasdental.com",
    "firstName": "New",
    "lastName": "Admin",
    "role": "admin"
  }
}
```

#### 3. Get Profile

**GET** `/auth/profile`

**Protected Route** - Requires valid JWT token

**Headers**:

```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "email": "admin@altasdental.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 4. Get Dashboard

**GET** `/auth/dashboard`

**Protected Route** - Requires valid JWT token

**Headers**:

```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "user_id_here",
      "email": "admin@altasdental.com",
      "firstName": "Admin",
      "lastName": "User",
      "lastLogin": "2024-01-15T14:20:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "dashboardStats": {
      "message": "Welcome to your dashboard"
    }
  }
}
```

#### 5. Logout

**GET** `/auth/logout`

**Protected Route** - Requires valid JWT token

**Headers**:

```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Testing with Postman

### 1. Create a Postman Collection

Open Postman and create a new collection called "Altas Dental Auth"

### 2. Login Request

**Create new request: POST**

- **URL**: `http://localhost:5000/api/auth/login`
- **Body** (raw, JSON):

```json
{
  "email": "admin@altasdental.com",
  "password": "AdminPassword123"
}
```

- **Click Send**
- **Save token** from the response

### 3. Set Auth Token as Variable

- In Postman, create an Environment variable
- Name it `token`
- Paste the token value from login response

### 4. Access Protected Routes

**Example: Get Profile**

- **Create new request: GET**
- **URL**: `http://localhost:5000/api/auth/profile`
- **Headers**:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`

- **Click Send** - Should return your admin profile

### 5. Create New Admin

**POST** `/auth/signup`

- **URL**: `http://localhost:5000/api/auth/signup`
- **Body**:

```json
{
  "email": "otheradmin@altasdental.com",
  "password": "OtherAdminPassword123",
  "firstName": "Other",
  "lastName": "Admin"
}
```

## Troubleshooting

### MongoDB Connection Issues

**Error**: `Error connecting to MongoDB`

**Solutions**:

1. Verify connection string in `.env`
2. Check MongoDB Atlas IP whitelist includes your IP
3. Ensure credentials are correct
4. Test connection URL directly

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS`

**Solutions**:

1. Verify `FRONTEND_URL` in backend `.env`
2. Ensure frontend is running on `http://localhost:3000`
3. Check CORS middleware in `server.js`

### Token Expiration

**Error**: `Not authorized to access this route`

**Solutions**:

1. Token may be expired (default: 7 days)
2. Re-login to get a new token
3. Check token format in headers: `Authorization: Bearer <token>`

### Login Modal Not Appearing

**Solutions**:

1. Clear browser cache
2. Check if `LoginModal` component is imported in Header
3. Verify no console errors in browser dev tools
4. Ensure backend is running on port 5000

## Security Best Practices

### Production Deployment

1. **Change JWT Secret**
   - Use a strong, random string
   - Store securely in environment variables

2. **Use HTTPS**
   - Enable SSL/TLS certificates
   - Never transmit tokens over HTTP

3. **Database Security**
   - Use strong MongoDB Atlas passwords
   - Restrict IP whitelist
   - Enable authentication

4. **CORS Configuration**
   - Specify exact frontend URL
   - Avoid wildcard origins in production

5. **Rate Limiting**
   - Implement rate limiting on login endpoints
   - Prevent brute force attacks

6. **Token Security**
   - Use secure, httpOnly cookies
   - Implement token refresh mechanism
   - Add token expiration

7. **Password Requirements**
   - Enforce strong passwords
   - Implement password change policy
   - Hash passwords with bcrypt (already implemented)

## File Structure

```
altas/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── Admin.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── errorHandler.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
├── components/
│   ├── Header.tsx (updated)
│   └── LoginModal.tsx (new)
├── context/
│   ├── AuthContext.tsx (new)
│   └── ThemeContext.tsx (existing)
├── utils/
│   └── auth.ts (new)
├── app/
│   ├── dashboard/
│   │   └── page.tsx (updated)
│   └── ... (other routes)
└── ...
```

## Next Steps

1. **Test the complete flow** - Login via frontend and access dashboard
2. **Test API endpoints** - Use Postman to verify all routes
3. **Create additional admins** - Use signup endpoint if needed
4. **Customize dashboard** - Add more features and statistics
5. **Deploy to production** - Follow security best practices

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review server logs for backend errors
3. Check browser console for frontend errors
4. Verify .env configuration matches your setup

## Version Information

- Node.js: v16+
- Express.js: 4.18.2
- MongoDB: Atlas
- Mongoose: 8.0.0
- bcryptjs: 2.4.3
- jsonwebtoken: 9.1.2
- Next.js: 14+
- React: 18+

## License

ISC
