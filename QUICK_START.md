# Quick Start Checklist

Complete these steps to get the authentication system running:

## ✅ Backend Setup (5-10 minutes)

- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file: `cp .env.example .env`
- [ ] Add MongoDB Atlas connection string to `.env`
- [ ] Add JWT secret to `.env`
- [ ] Create admin user: `npm run seed`
- [ ] Start backend: `npm run dev`
- [ ] Verify server: Open browser to `http://localhost:5000/api/health`

## ✅ Frontend Setup (2-5 minutes)

- [ ] Files already created:
  - `utils/auth.ts` ✓
  - `components/LoginModal.tsx` ✓
  - `components/Header.tsx` (updated) ✓
  - `app/dashboard/page.tsx` (updated) ✓
  - `context/AuthContext.tsx` ✓
- [ ] Install dependencies (if not done): `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Verify app: Open browser to `http://localhost:3000`

## ✅ Test Login Flow

- [ ] Click "Account" button in header
- [ ] Login modal appears
- [ ] Enter email: `admin@altasdental.com`
- [ ] Enter password: `AdminPassword123`
- [ ] Click Login
- [ ] Should redirect to `/dashboard`
- [ ] Dashboard displays admin profile

## ✅ Production Setup (Before Deployment)

- [ ] Change JWT secret to a strong value
- [ ] Update FRONTEND_URL for production domain
- [ ] Set NODE_ENV to `production`
- [ ] Use HTTPS URLs
- [ ] Implement rate limiting
- [ ] Add password change functionality
- [ ] Set up logging and monitoring

## 🔑 Default Credentials

```
Email:    admin@altasdental.com
Password: AdminPassword123
```

⚠️ **Change immediately after first login!**

## 📝 Key Environment Variables

```env
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<strong-secret-key>
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Commands

**Backend:**
```bash
cd backend
npm install        # Install dependencies
npm run dev       # Start development server
npm run seed      # Create admin user
npm start         # Start production server
```

**Frontend:**
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
```

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:5000 | API server |
| API Health | http://localhost:5000/api/health | Verify backend |
| Frontend | http://localhost:3000 | App interface |
| Dashboard | http://localhost:3000/dashboard | Admin dashboard |
| Login | Click Account button | Start login |

## 📚 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | No | Admin login |
| POST | `/api/auth/signup` | No | Create new admin |
| GET | `/api/auth/profile` | Yes | Get admin profile |
| GET | `/api/auth/dashboard` | Yes | Get dashboard data |
| GET | `/api/auth/logout` | Yes | Logout |

## 🔍 Testing with Postman

1. Import these endpoints
2. Login to get token
3. Use token in Authorization header for protected routes
4. Example header: `Authorization: Bearer <token>`

## ❌ Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB not connecting | Check connection string in `.env` |
| CORS error | Verify FRONTEND_URL in backend `.env` |
| Token expired | Login again to get new token |
| Login modal not showing | Clear cache, check console for errors |
| 404 on dashboard | Check that backend is running |

## 📖 Documentation

- Full setup guide: `AUTHENTICATION_SETUP_GUIDE.md`
- Backend README: `backend/README.md`
- Auth utilities: `utils/auth.ts`

## ✨ Features

✅ JWT-based authentication
✅ Admin-only login (no public signup)
✅ MongoDB Atlas integration
✅ Secure password hashing (bcrypt)
✅ Protected routes middleware
✅ Login modal in header
✅ Dashboard with profile info
✅ Logout functionality
✅ Error handling
✅ CORS enabled for frontend
