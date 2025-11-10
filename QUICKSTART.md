# Quick Start Guide

## Prerequisites Check
- ✅ Node.js installed (v14+)
- ✅ MongoDB installed and running
- ✅ npm or yarn installed

## Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Configure Backend
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/complaint_management
JWT_SECRET=your_secret_jwt_key_change_in_production
```

### 4. Seed Admin Users
```bash
cd backend
npm run seed
```

This creates 5 admin accounts:
- **Café**: cafe@university.edu
- **IT**: it@university.edu
- **Library**: library@university.edu
- **Dorm**: dorm@university.edu
- **Registrar**: registrar@university.edu

Password for all: `admin123`

### 5. Start MongoDB
```bash
# Linux/Mac
mongod

# Or using systemd
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 6. Start Backend Server
```bash
cd backend
npm run dev
```

Server runs on `http://localhost:5000`

### 7. Start Frontend Server
```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`

## Testing the Application

### As a Student:
1. Go to `http://localhost:3000`
2. Click "Student"
3. Select a department (e.g., "Café")
4. Write a complaint
5. Submit and note your Ticket ID
6. View complaints in the dashboard
7. Like complaints (one like per device)

### As an Admin:
1. Go to `http://localhost:3000`
2. Click "Admin"
3. Login with:
   - Email: `cafe@university.edu`
   - Password: `admin123`
4. View complaints for your department
5. Update status (Pending → In Progress → Resolved)
6. Add replies to complaints
7. View statistics

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Try: `mongosh` to test MongoDB connection

### Port Already in Use
- Change `PORT` in `backend/.env`
- Or kill the process using the port:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### CORS Errors
- Make sure backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env` (optional)
- Backend should allow CORS from `http://localhost:3000`

### Cannot Like Complaints
- Check browser console for errors
- Clear localStorage and try again
- Make sure backend is receiving the `x-user-id` header

## Next Steps

1. **Change Default Passwords**: Update admin passwords in production
2. **Configure Email**: Set up email service in `.env` for notifications
3. **Secure JWT Secret**: Use a strong random string for `JWT_SECRET`
4. **Database**: Use MongoDB Atlas for production
5. **Deploy**: Deploy backend to Heroku/Railway and frontend to Vercel/Netlify

## Need Help?

Check the main `README.md` for detailed documentation.

