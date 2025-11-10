# Complete Project Explanation: Anonymous University Complaint Management System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Dependencies](#dependencies)
4. [Database Models & Schema](#database-models--schema)
5. [Backend Logic & API Endpoints](#backend-logic--api-endpoints)
6. [Frontend Logic & Components](#frontend-logic--components)
7. [Security Implementation](#security-implementation)
8. [Data Flow & User Journeys](#data-flow--user-journeys)
9. [Key Features Explained](#key-features-explained)
10. [How Everything Works Together](#how-everything-works-together)

---

## 🎯 Project Overview

This is a **full-stack web application** that allows students to submit anonymous complaints to specific university departments. The system has two main user types:

1. **Students**: Can submit complaints anonymously, view complaints, and like them
2. **Admins**: Department-specific administrators who can manage complaints, update statuses, and reply

### Core Purpose
- Enable anonymous complaint submission
- Organize complaints by department (Café, IT, Library, Dorm, Registrar)
- Allow students to like complaints (one like per device)
- Provide admins with tools to manage and respond to complaints
- Display complaints ranked by likes or date

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for building REST APIs
- **MongoDB** - NoSQL database for storing data
- **Mongoose** - ODM (Object Document Mapper) for MongoDB

**Frontend:**
- **React** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework

### Project Structure

```
projectFeedback/
├── backend/
│   ├── models/          # Database schemas (Complaint, Admin, Like)
│   ├── routes/          # API route handlers (complaints.js, admin.js)
│   ├── middleware/      # Authentication middleware (auth.js)
│   ├── utils/           # Helper functions (ticket generation, user ID, email)
│   ├── scripts/         # Database seeding script
│   └── server.js        # Main server file
│
└── frontend/
    ├── src/
    │   ├── pages/       # React page components
    │   ├── components/  # Reusable components (ProtectedRoute)
    │   ├── utils/       # API client and utilities
    │   ├── App.js       # Main app component with routing
    │   └── index.js     # React entry point
    └── public/          # Static files
```

---

## 📦 Dependencies

### Backend Dependencies (`backend/package.json`)

1. **express** (^4.18.2)
   - Web framework for Node.js
   - Handles HTTP requests, routing, middleware

2. **mongoose** (^7.5.0)
   - MongoDB object modeling tool
   - Provides schema validation, middleware, query building

3. **bcryptjs** (^2.4.3)
   - Password hashing library
   - Used to hash admin passwords before storing

4. **jsonwebtoken** (^9.0.2)
   - JWT (JSON Web Token) implementation
   - Used for admin authentication

5. **cors** (^2.8.5)
   - Cross-Origin Resource Sharing middleware
   - Allows frontend (port 3000) to communicate with backend (port 5000)

6. **dotenv** (^16.3.1)
   - Loads environment variables from `.env` file
   - Stores sensitive data (JWT_SECRET, MongoDB URI, etc.)

7. **nodemailer** (^6.9.7)
   - Email sending library
   - Optional: sends notifications when new complaints are submitted

**Dev Dependencies:**
- **nodemon** (^3.0.1) - Auto-restarts server during development

### Frontend Dependencies (`frontend/package.json`)

1. **react** (^18.2.0)
   - UI library for building components

2. **react-dom** (^18.2.0)
   - React renderer for the web

3. **react-router-dom** (^6.16.0)
   - Declarative routing for React
   - Handles navigation between pages

4. **axios** (^1.5.0)
   - Promise-based HTTP client
   - Makes API calls to backend

5. **react-scripts** (5.0.1)
   - Create React App scripts
   - Handles build, development server, testing

**Dev Dependencies:**
- **tailwindcss** (^3.3.5) - CSS framework
- **autoprefixer** (^10.4.16) - CSS vendor prefixing
- **postcss** (^8.4.31) - CSS transformation tool

---

## 🗄️ Database Models & Schema

### 1. Complaint Model (`backend/models/Complaint.js`)

**Schema Fields:**
```javascript
{
  department: String (required, enum: ['Café', 'IT', 'Library', 'Dorm', 'Registrar']),
  message: String (required, trimmed),
  likes: Number (default: 0),
  status: String (enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending'),
  ticketId: String (unique),
  reply: String (default: ''),
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `{ department: 1, createdAt: -1 }` - Optimizes queries by department and date
- `{ likes: -1 }` - Optimizes sorting by likes

**Purpose:** Stores all complaint data. Anonymous (no user info stored).

### 2. Admin Model (`backend/models/Admin.js`)

**Schema Fields:**
```javascript
{
  name: String (required, trimmed),
  department: String (required, enum: ['Café', 'IT', 'Library', 'Dorm', 'Registrar']),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, hashed with bcrypt)
}
```

**Pre-save Hook:**
- Automatically hashes password before saving using bcrypt (10 salt rounds)

**Methods:**
- `comparePassword(candidatePassword)` - Compares plain password with hashed password

**Purpose:** Stores admin credentials. Each admin belongs to one department.

### 3. Like Model (`backend/models/Like.js`)

**Schema Fields:**
```javascript
{
  complaintId: ObjectId (required, references Complaint),
  userIdentifier: String (required)
}
```

**Indexes:**
- `{ complaintId: 1, userIdentifier: 1 }` (unique) - Prevents duplicate likes

**Purpose:** Tracks which users (identified by device/browser) have liked which complaints. Prevents multiple likes from the same device.

---

## 🔧 Backend Logic & API Endpoints

### Server Setup (`backend/server.js`)

1. **Initialization:**
   - Creates Express app
   - Sets `trust proxy` to get accurate IP addresses
   - Configures CORS (allows all origins)
   - Parses JSON request bodies

2. **Routes:**
   - `/api/complaints` → `routes/complaints.js`
   - `/api/admin` → `routes/admin.js`

3. **Database Connection:**
   - Connects to MongoDB using URI from environment variables
   - Falls back to `mongodb://localhost:27017/complaint_management`

4. **Server Start:**
   - Listens on port 5000 (or PORT from .env)

### Student Endpoints (`backend/routes/complaints.js`)

#### 1. `POST /api/complaints` - Create Complaint

**Logic Flow:**
1. Validates `department` and `message` in request body
2. Validates department is one of the allowed values
3. Generates unique ticket ID (format: `TICKET-XXXXXXXX`)
   - Uses crypto.randomBytes for randomness
   - Checks for uniqueness in database
   - Retries if duplicate found
4. Creates new Complaint document
5. Saves to database
6. Sends optional email notification (if configured)
7. Returns ticket ID and complaint data

**Key Code:**
```javascript
let ticketId;
let isUnique = false;
while (!isUnique) {
  ticketId = generateTicketId();
  const existing = await Complaint.findOne({ ticketId });
  if (!existing) isUnique = true;
}
```

#### 2. `GET /api/complaints/:department` - Get Complaints by Department

**Query Parameters:**
- `sortBy` - 'likes' (default) or 'date'
- `search` - Keyword to search in complaint messages

**Logic Flow:**
1. Validates department parameter
2. Builds MongoDB query:
   - Filters by department
   - Adds regex search filter if `search` provided (case-insensitive)
3. Determines sort order:
   - `date`: Sort by `createdAt: -1` (newest first)
   - `likes`: Sort by `likes: -1, createdAt: -1` (most liked first, then newest)
4. Executes query with `.lean()` (returns plain objects, not Mongoose documents)
5. Returns array of complaints

**Key Code:**
```javascript
let query = { department };
if (search && search.trim()) {
  query.message = { $regex: search.trim(), $options: 'i' };
}
let sort = sortBy === 'date' 
  ? { createdAt: -1 } 
  : { likes: -1, createdAt: -1 };
```

#### 3. `POST /api/complaints/:id/like` - Like a Complaint

**Logic Flow:**
1. Extracts user identifier from request:
   - First tries `x-user-id` header (set by frontend from localStorage)
   - Falls back to IP + User Agent hash
2. Checks if complaint exists
3. Checks if user has already liked this complaint (using Like model)
4. If already liked, returns error
5. Creates new Like document (prevents duplicate likes via unique index)
6. Increments complaint's `likes` count
7. Saves both Like and Complaint
8. Returns updated like count

**Key Code:**
```javascript
const userIdentifier = getUserIdentifier(req);
const existingLike = await Like.findOne({
  complaintId: id,
  userIdentifier
});
if (existingLike) {
  return res.status(400).json({ error: 'You have already liked this complaint' });
}
```

### Admin Endpoints (`backend/routes/admin.js`)

#### 1. `POST /api/admin/login` - Admin Authentication

**Logic Flow:**
1. Validates email and password in request body
2. Normalizes email (lowercase, trimmed) to match schema
3. Finds admin by email in database
4. Compares provided password with hashed password using `bcrypt.compare()`
5. If credentials valid:
   - Generates JWT token containing `{ id: admin._id, department: admin.department }`
   - Token expires in 7 days
   - Returns token and admin info (without password)
6. If invalid, returns 401 error

**Key Code:**
```javascript
const token = jwt.sign(
  { id: admin._id, department: admin.department },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

#### 2. `GET /api/admin/complaints` - Get Admin's Department Complaints

**Middleware:** `authMiddleware` (requires valid JWT token)

**Logic Flow:**
1. Extracts admin info from JWT token (via middleware)
2. Gets admin's department from `req.admin.department`
3. Builds query filtering by department
4. Adds search filter if provided
5. Sorts by likes or date (same as student endpoint)
6. Returns complaints for admin's department only

**Security:** Admin can only see complaints from their own department.

#### 3. `GET /api/admin/stats` - Get Statistics

**Middleware:** `authMiddleware`

**Logic Flow:**
1. Gets admin's department
2. Uses MongoDB aggregation to:
   - Group complaints by status
   - Count total complaints
   - Sum total likes across all complaints
3. Returns statistics object:
   ```javascript
   {
     statusDistribution: [{ _id: 'Pending', count: 5 }, ...],
     totalComplaints: 20,
     totalLikes: 45
   }
   ```

**Key Code:**
```javascript
const stats = await Complaint.aggregate([
  { $match: { department } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

#### 4. `PUT /api/admin/complaints/:id/status` - Update Complaint Status

**Middleware:** `authMiddleware`

**Logic Flow:**
1. Validates status is one of: 'Pending', 'In Progress', 'Resolved'
2. Finds complaint by ID
3. **Security Check:** Verifies complaint belongs to admin's department
4. Updates status
5. Saves complaint
6. Returns updated complaint

**Key Code:**
```javascript
if (complaint.department !== req.admin.department) {
  return res.status(403).json({ error: 'Access denied' });
}
```

#### 5. `PUT /api/admin/complaints/:id/reply` - Add/Update Reply

**Middleware:** `authMiddleware`

**Logic Flow:**
1. Validates reply text is provided
2. Finds complaint by ID
3. **Security Check:** Verifies complaint belongs to admin's department
4. Updates `reply` field
5. Saves complaint
6. Returns updated complaint

### Authentication Middleware (`backend/middleware/auth.js`)

**Purpose:** Protects admin routes by verifying JWT tokens

**Logic Flow:**
1. Extracts token from `Authorization` header (format: `Bearer <token>`)
2. If no token, returns 401 error
3. Verifies token using JWT_SECRET
4. Finds admin by ID from token payload
5. If admin not found, returns 401 error
6. Attaches admin object to `req.admin` for use in route handlers
7. Calls `next()` to continue to route handler

**Key Code:**
```javascript
const token = req.header('Authorization')?.replace('Bearer ', '');
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const admin = await Admin.findById(decoded.id).select('-password');
req.admin = admin;
next();
```

### Utility Functions

#### `generateTicketId()` (`backend/utils/generateTicketId.js`)
- Generates unique ticket IDs in format: `TICKET-XXXXXXXX`
- Uses `crypto.randomBytes(4)` to generate 8 hex characters
- Converts to uppercase

#### `getUserIdentifier(req)` (`backend/utils/getUserIdentifier.js`)
- Generates unique identifier for users (for like tracking)
- Priority:
  1. `x-user-id` header (from frontend localStorage)
  2. Fallback: Hash of IP address + User Agent string
- Returns string like `user_abc123`

#### `emailService.js` (`backend/utils/emailService.js`)
- Configures Nodemailer if EMAIL_USER and EMAIL_PASS are set
- `sendComplaintNotification()` - Sends email when new complaint is created
- Optional feature (doesn't break if not configured)

---

## 🎨 Frontend Logic & Components

### App Structure (`frontend/src/App.js`)

**Routing Setup:**
- Uses React Router for client-side routing
- Routes:
  - `/` → LandingPage
  - `/student/submit` → StudentSubmission
  - `/student/dashboard` → StudentDashboard
  - `/admin/login` → AdminLogin
  - `/admin/dashboard` → AdminDashboard (protected)
  - `*` → Redirects to `/`

**Protected Route:**
- `/admin/dashboard` wrapped in `<ProtectedRoute>` component
- Checks for admin token in localStorage
- Redirects to login if not authenticated

### API Client (`frontend/src/utils/api.js`)

**Axios Configuration:**
- Base URL: `http://localhost:5000/api` (or from REACT_APP_API_URL)
- Sets `Content-Type: application/json` header

**User ID Management:**
- Generates unique user ID on first visit
- Stores in localStorage
- Sends as `x-user-id` header in all requests
- Used by backend to prevent duplicate likes

**Token Management:**
- `setAuthToken(token)` - Sets/removes JWT token
- Stores token in localStorage and axios default headers
- Loads token on app initialization

**API Functions:**
- `submitComplaint(department, message)` - POST /api/complaints
- `getComplaints(department, sortBy, search)` - GET /api/complaints/:department
- `likeComplaint(complaintId)` - POST /api/complaints/:id/like
- `adminLogin(email, password)` - POST /api/admin/login
- `getAdminComplaints(sortBy, search)` - GET /api/admin/complaints
- `updateComplaintStatus(complaintId, status)` - PUT /api/admin/complaints/:id/status
- `addComplaintReply(complaintId, reply)` - PUT /api/admin/complaints/:id/reply
- `getAdminStats()` - GET /api/admin/stats

### Pages

#### 1. LandingPage (`frontend/src/pages/LandingPage.js`)

**Purpose:** Entry point with navigation buttons

**Features:**
- Two buttons: "Student" and "Admin"
- Navigates to respective pages
- Styled with Tailwind CSS (gradient background, cards)

#### 2. StudentSubmission (`frontend/src/pages/StudentSubmission.js`)

**State:**
- `department` - Selected department
- `message` - Complaint text
- `loading` - Loading state during submission

**Logic:**
1. User selects department from dropdown
2. User enters complaint message
3. On submit:
   - Validates fields
   - Calls `submitComplaint()` API
   - Shows success notification with ticket ID
   - Redirects to dashboard after 1.5 seconds
4. Displays loading state during submission

**Key Features:**
- Form validation
- Success/error notifications
- Auto-redirect after submission

#### 3. StudentDashboard (`frontend/src/pages/StudentDashboard.js`)

**State:**
- `department` - Selected department (from URL state or dropdown)
- `complaints` - Array of complaints
- `loading` - Loading state
- `sortBy` - 'likes' or 'date'
- `search` - Search keyword
- `likedComplaints` - Set of complaint IDs user has liked (from localStorage)

**Logic:**
1. **On Mount:**
   - Loads liked complaints from localStorage
   - If department in URL state, fetches complaints

2. **Fetch Complaints:**
   - Calls `getComplaints()` with department, sortBy, search
   - Updates complaints state
   - Shows loading spinner

3. **Like Functionality:**
   - Checks if already liked (localStorage + state)
   - Calls `likeComplaint()` API
   - Updates local state (increments likes, adds to liked set)
   - Saves liked complaints to localStorage
   - Shows notification

4. **Display:**
   - Shows complaints with:
     - Ticket ID badge
     - Status badge (color-coded)
     - Message text
     - Admin reply (if exists)
     - Date
     - Like button (disabled if already liked)

**Key Features:**
- Department selector
- Sort by likes or date
- Search functionality
- Like prevention (client-side + server-side)
- Real-time like count updates

#### 4. AdminLogin (`frontend/src/pages/AdminLogin.js`)

**State:**
- `email` - Admin email
- `password` - Admin password
- `loading` - Loading state

**Logic:**
1. User enters email and password
2. On submit:
   - Validates fields
   - Calls `adminLogin()` API
   - On success:
     - Stores JWT token using `setAuthToken()`
     - Stores admin info in localStorage
     - Shows success notification
     - Redirects to admin dashboard
   - On error: Shows error notification

**Key Features:**
- Form validation
- Error handling
- Token storage
- Auto-redirect on success

#### 5. AdminDashboard (`frontend/src/pages/AdminDashboard.js`)

**State:**
- `complaints` - Array of complaints
- `loading` - Loading state
- `sortBy` - 'likes' or 'date'
- `search` - Search keyword
- `admin` - Admin info from localStorage
- `stats` - Statistics data
- `selectedComplaint` - Complaint being replied to
- `replyText` - Reply text for modal
- `showReplyModal` - Modal visibility

**Logic:**
1. **On Mount:**
   - Loads admin from localStorage
   - Redirects to login if no admin
   - Fetches complaints and stats

2. **Fetch Data:**
   - `fetchComplaints()` - Gets complaints for admin's department
   - `fetchStats()` - Gets statistics (total complaints, likes, status distribution)

3. **Status Update:**
   - Calls `updateComplaintStatus()` API
   - Refreshes complaints and stats
   - Shows notification

4. **Reply Functionality:**
   - Opens modal with complaint details
   - Pre-fills existing reply if editing
   - Calls `addComplaintReply()` API
   - Closes modal and refreshes complaints

5. **Logout:**
   - Removes token and admin from localStorage
   - Redirects to login

**Display:**
- Statistics cards (total complaints, total likes, status distribution)
- Sort and search controls
- Complaint list with:
  - Ticket ID
  - Status (color-coded)
  - Date
  - Like count
  - Message
  - Existing reply (if any)
  - Status dropdown (to update)
  - Reply button (opens modal)

**Key Features:**
- Department-specific complaints only
- Statistics dashboard
- Status management
- Reply management
- Search and sort
- Protected route

### ProtectedRoute Component (`frontend/src/components/ProtectedRoute.js`)

**Purpose:** Protects admin routes from unauthorized access

**Logic:**
1. Checks for `admin` and `adminToken` in localStorage
2. If missing, redirects to `/admin/login`
3. If present, renders child component (AdminDashboard)

### Notification System (`frontend/src/utils/notifications.js`)

**Purpose:** Shows temporary success/error messages

**Implementation:**
- Creates DOM element dynamically
- Positions at top-right
- Color-coded (green for success, red for error)
- Animates in from right
- Auto-removes after 3 seconds
- Uses Tailwind CSS classes

---

## 🔒 Security Implementation

### 1. Password Security
- **Hashing:** Passwords hashed with bcrypt (10 salt rounds)
- **Storage:** Only hashed passwords stored in database
- **Comparison:** Uses `bcrypt.compare()` to verify passwords (timing-safe)

### 2. Authentication
- **JWT Tokens:** Stateless authentication
- **Token Expiry:** 7 days
- **Token Storage:** localStorage (frontend) + Authorization header (requests)
- **Token Verification:** Middleware verifies token on every protected request

### 3. Authorization
- **Department-Based Access:** Admins can only access complaints from their department
- **Route Protection:** ProtectedRoute component prevents unauthorized access
- **Server-Side Validation:** Backend verifies department ownership before updates

### 4. Like Prevention
- **Multi-Layer Protection:**
  1. **Client-Side:** localStorage tracks liked complaints
  2. **Server-Side:** Like model with unique index prevents duplicates
  3. **User Identification:** Combination of localStorage ID + IP/User Agent hash

### 5. Input Validation
- **Required Fields:** Validated on both client and server
- **Enum Validation:** Department and status values validated against allowed list
- **Email Normalization:** Lowercase and trimmed
- **Message Trimming:** Whitespace removed from complaint messages

### 6. CORS
- Configured to allow requests from frontend origin
- Prevents unauthorized cross-origin requests

---

## 🔄 Data Flow & User Journeys

### Student Journey: Submitting a Complaint

1. **Landing Page** → Click "Student" → Navigate to `/student/submit`
2. **StudentSubmission Page:**
   - Select department from dropdown
   - Enter complaint message
   - Click "Submit Complaint"
3. **Frontend API Call:**
   - `submitComplaint(department, message)` → POST `/api/complaints`
   - Sends `x-user-id` header (from localStorage)
4. **Backend Processing:**
   - Validates department and message
   - Generates unique ticket ID
   - Creates Complaint document
   - Saves to MongoDB
   - Sends optional email notification
5. **Response:**
   - Returns ticket ID and complaint data
6. **Frontend:**
   - Shows success notification with ticket ID
   - Redirects to `/student/dashboard` after 1.5 seconds

### Student Journey: Viewing & Liking Complaints

1. **StudentDashboard Page:**
   - Select department from dropdown
   - Optionally set sort order (likes/date)
   - Optionally enter search keyword
2. **Frontend API Call:**
   - `getComplaints(department, sortBy, search)` → GET `/api/complaints/:department?sortBy=likes&search=...`
3. **Backend Processing:**
   - Validates department
   - Builds MongoDB query with filters
   - Sorts results
   - Returns array of complaints
4. **Frontend Display:**
   - Renders complaints in cards
   - Shows ticket ID, status, message, reply, date, likes
   - Disables like button if already liked (from localStorage)
5. **Like Action:**
   - User clicks like button
   - Frontend checks localStorage (client-side check)
   - `likeComplaint(complaintId)` → POST `/api/complaints/:id/like`
   - Backend:
     - Gets user identifier
     - Checks Like model for duplicate
     - Creates Like document
     - Increments complaint likes
   - Frontend:
     - Updates local state
     - Saves to localStorage
     - Shows notification

### Admin Journey: Login & Managing Complaints

1. **Landing Page** → Click "Admin" → Navigate to `/admin/login`
2. **AdminLogin Page:**
   - Enter email and password
   - Click "Login"
3. **Frontend API Call:**
   - `adminLogin(email, password)` → POST `/api/admin/login`
4. **Backend Processing:**
   - Finds admin by email
   - Compares password with bcrypt
   - Generates JWT token
   - Returns token and admin info
5. **Frontend:**
   - Stores token using `setAuthToken()`
   - Stores admin info in localStorage
   - Redirects to `/admin/dashboard`
6. **AdminDashboard Page:**
   - Loads admin from localStorage
   - Fetches complaints: `getAdminComplaints()` → GET `/api/admin/complaints`
     - Backend: Verifies JWT, filters by admin's department
   - Fetches stats: `getAdminStats()` → GET `/api/admin/stats`
     - Backend: Aggregates data for admin's department
7. **Status Update:**
   - Admin changes status dropdown
   - `updateComplaintStatus(complaintId, status)` → PUT `/api/admin/complaints/:id/status`
   - Backend: Verifies department ownership, updates status
   - Frontend: Refreshes complaints and stats
8. **Add Reply:**
   - Admin clicks "Add Reply" button
   - Modal opens with textarea
   - Admin enters reply
   - `addComplaintReply(complaintId, reply)` → PUT `/api/admin/complaints/:id/reply`
   - Backend: Verifies department ownership, saves reply
   - Frontend: Closes modal, refreshes complaints

---

## ✨ Key Features Explained

### 1. Anonymous Complaint Submission
- **How:** No user registration or login required
- **Implementation:** Complaint model doesn't store user information
- **Benefit:** Encourages honest feedback without fear

### 2. Ticket ID System
- **Purpose:** Allows students to track their complaints
- **Format:** `TICKET-XXXXXXXX` (8 hex characters)
- **Generation:** Uses crypto.randomBytes for uniqueness
- **Uniqueness:** Backend checks database before assigning

### 3. Like System with Duplicate Prevention
- **Client-Side:** localStorage tracks liked complaints
- **Server-Side:** Like model with unique index on `(complaintId, userIdentifier)`
- **User Identification:** 
  - Primary: localStorage ID (sent as `x-user-id` header)
  - Fallback: Hash of IP + User Agent
- **Result:** One like per device/browser

### 4. Department-Based Organization
- **Departments:** Café, IT, Library, Dorm, Registrar
- **Student View:** Filter complaints by department
- **Admin View:** Only see complaints from their department
- **Security:** Backend enforces department ownership

### 5. Status Management
- **Statuses:** Pending → In Progress → Resolved
- **Workflow:** Admins update status via dropdown
- **Visual:** Color-coded badges (gray/yellow/green)

### 6. Search Functionality
- **Implementation:** MongoDB regex search (case-insensitive)
- **Scope:** Searches complaint message text
- **Usage:** Available in both student and admin dashboards

### 7. Sorting Options
- **By Likes:** Most liked complaints first (then by date)
- **By Date:** Newest complaints first
- **Implementation:** MongoDB sort with compound indexes

### 8. Statistics Dashboard
- **Metrics:**
  - Total complaints in department
  - Total likes across all complaints
  - Status distribution (count by status)
- **Implementation:** MongoDB aggregation pipeline
- **Display:** Cards with color-coded metrics

### 9. Admin Reply System
- **Feature:** Admins can add/edit replies to complaints
- **Display:** Replies shown in highlighted box below complaint
- **Storage:** Stored in Complaint model's `reply` field

### 10. Responsive Design
- **Framework:** Tailwind CSS utility classes
- **Breakpoints:** Mobile-first design with `md:` breakpoints
- **Layout:** Grid layouts adapt to screen size

---

## 🔗 How Everything Works Together

### Request Flow Example: Student Likes a Complaint

1. **User Action:** Student clicks like button on complaint card
2. **Frontend Check:** `StudentDashboard.js` checks `likedComplaints` Set
3. **API Call:** `likeComplaint(complaintId)` in `api.js`
4. **Axios Interceptor:** Adds `x-user-id` header from localStorage
5. **HTTP Request:** POST to `http://localhost:5000/api/complaints/:id/like`
6. **Backend Route:** `routes/complaints.js` handles POST `/api/complaints/:id/like`
7. **User Identification:** `getUserIdentifier()` extracts user ID from header
8. **Duplicate Check:** Queries Like model for existing like
9. **Database Operations:**
   - Creates Like document (unique index prevents duplicates)
   - Updates Complaint document (increments likes)
10. **Response:** Returns updated like count
11. **Frontend Update:**
    - Updates `complaints` state (increments likes)
    - Adds complaint ID to `likedComplaints` Set
    - Saves Set to localStorage
    - Shows success notification
12. **UI Update:** Like button becomes disabled, like count increases

### Authentication Flow Example: Admin Login

1. **User Action:** Admin enters credentials and clicks "Login"
2. **API Call:** `adminLogin(email, password)` in `api.js`
3. **HTTP Request:** POST to `http://localhost:5000/api/admin/login`
4. **Backend Route:** `routes/admin.js` handles POST `/api/admin/login`
5. **Database Query:** Finds Admin by email
6. **Password Verification:** `bcrypt.compare()` checks password
7. **Token Generation:** `jwt.sign()` creates JWT with admin ID and department
8. **Response:** Returns token and admin info (without password)
9. **Frontend Storage:**
    - `setAuthToken()` stores token in localStorage and axios headers
    - Stores admin info in localStorage
10. **Navigation:** Redirects to `/admin/dashboard`
11. **Protected Route:** `ProtectedRoute` checks for token, allows access
12. **Dashboard Load:** Fetches complaints and stats with token in Authorization header
13. **Backend Verification:** `authMiddleware` verifies token, attaches admin to request
14. **Department Filter:** Backend returns only complaints from admin's department

### Database Relationships

```
Complaint (1) ──< (Many) Like
  - Each complaint can have many likes
  - Like references Complaint via complaintId

Admin (1) ──< (Many) Complaint (conceptually)
  - Each admin manages complaints from their department
  - No direct foreign key, filtered by department field
```

### State Management

**Frontend State:**
- React `useState` hooks for component state
- localStorage for persistent data (user ID, liked complaints, admin token)
- No global state management library (Redux, Context API)

**Backend State:**
- Stateless (except database)
- JWT tokens contain necessary info (admin ID, department)
- No server-side sessions

---

## 📝 Summary

This is a **complete full-stack application** with:

- **Backend:** RESTful API built with Express.js and MongoDB
- **Frontend:** Single-page application built with React
- **Security:** JWT authentication, password hashing, department-based access control
- **Features:** Anonymous complaints, likes, search, sort, status management, replies, statistics
- **Architecture:** Separation of concerns (models, routes, middleware, utils)
- **User Experience:** Responsive design, notifications, loading states, error handling

The system allows students to submit anonymous complaints and interact with them, while providing department admins with tools to manage and respond to complaints efficiently.

