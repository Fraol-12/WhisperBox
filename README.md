# Anonymous University Complaint Management System

A full-stack web application where students can submit complaints anonymously to specific departments. Complaints are displayed in dashboards, ranked by likes. Department-based admins can manage complaints securely.

## Features

### Student Features
- Submit anonymous complaints to specific departments (Café, IT, Library, Dorm, Registrar)
- View complaints by department
- Like complaints (one like per device)
- Search complaints by keywords
- Sort complaints by most liked or latest
- View ticket IDs for submitted complaints
- See admin replies to complaints

### Admin Features
- Secure login with JWT authentication
- View complaints for their department only
- Update complaint status (Pending, In Progress, Resolved)
- Add/edit replies to complaints
- View statistics dashboard
- Search and sort complaints
- Sort by likes or date

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Nodemailer for email notifications (optional)

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Responsive design (mobile + desktop)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/complaint_management
JWT_SECRET=your_secret_jwt_key_change_in_production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Seed Admin Users

```bash
cd backend
npm run seed
```

This will create 5 admin users (one for each department):
- Email: `cafe@university.edu`, `it@university.edu`, `library@university.edu`, `dorm@university.edu`, `registrar@university.edu`
- Password: `admin123` (change in production!)

## Running the Application

### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Linux/Mac
mongod

# Or if using systemd
sudo systemctl start mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Student Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/complaints` | Create a new complaint |
| GET | `/api/complaints/:department` | Get complaints by department |
| POST | `/api/complaints/:id/like` | Like a complaint |

### Admin Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/complaints` | Get complaints for admin's department |
| GET | `/api/admin/stats` | Get statistics |
| PUT | `/api/admin/complaints/:id/status` | Update complaint status |
| PUT | `/api/admin/complaints/:id/reply` | Add/update reply |

## Project Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── Complaint.js
│   │   ├── Admin.js
│   │   └── Like.js
│   ├── routes/
│   │   ├── complaints.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── generateTicketId.js
│   │   ├── emailService.js
│   │   └── getUserIdentifier.js
│   ├── scripts/
│   │   └── seedAdmins.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── StudentSubmission.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   └── AdminDashboard.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── notifications.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Usage

1. **As a Student:**
   - Click "Student" on the landing page
   - Select a department and submit your complaint
   - View your ticket ID after submission
   - Browse complaints in the dashboard
   - Like complaints (one like per device)
   - Search and sort complaints

2. **As an Admin:**
   - Click "Admin" on the landing page
   - Login with your credentials
   - View complaints for your department
   - Update complaint status
   - Add replies to complaints
   - View statistics

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication for admins
- User identification for like prevention (LocalStorage + browser fingerprinting)
- Department-based access control for admins
- Input validation and sanitization

## Optional Features

- Email notifications for new complaints (configure in `.env`)
- Ticket ID generation for complaints
- Search functionality
- Statistics dashboard with charts
- Responsive design for mobile devices

## Production Deployment

1. Change JWT_SECRET to a strong random string
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Configure email service for notifications
4. Change default admin passwords
5. Set up environment variables properly
6. Build the frontend: `cd frontend && npm run build`
7. Serve the frontend build with a web server (nginx, Apache, etc.)
8. Use PM2 or similar for process management

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!

