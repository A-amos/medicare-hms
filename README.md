# 🏥 MediCare HMS — Hospital Management System

A **production-style, full-stack Hospital Management System** built with **Node.js, Express, MongoDB Atlas, and Vanilla JavaScript**.  
Designed as a clean and professional ICT portfolio project with authentication, CRUD operations, appointment scheduling, dashboard analytics, and responsive UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose ODM |
| Authentication | JSON Web Tokens (JWT) + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |

---

# 📁 Project Structure

```bash
medicare-hms/
│
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── seed.js              # Database seeder
│   │
│   ├── controllers/
│   │   ├── authController.js        # Login, logout, JWT auth
│   │   ├── patientController.js     # Patient CRUD operations
│   │   ├── doctorController.js      # Doctor CRUD operations
│   │   └── appointmentController.js # Appointment CRUD operations
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT protection middleware
│   │   └── errorHandler.js      # Centralized error handling
│   │
│   ├── models/
│   │   ├── User.js              # Admin user schema
│   │   ├── Patient.js           # Patient schema
│   │   ├── Doctor.js            # Doctor schema
│   │   └── Appointment.js       # Appointment schema
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   └── appointments.js
│   │
│   └── server.js                # Express server entry point
│
├── frontend/
│   ├── css/
│   │   └── style.css            # Custom styling
│   │
│   ├── js/
│   │   ├── api.js               # API client
│   │   ├── auth.js              # Login/logout/session handling
│   │   ├── ui.js                # Toasts, modals, helpers
│   │   ├── layout.js            # Sidebar/topbar layout
│   │   ├── dashboard.js         # Dashboard functionality
│   │   ├── patients.js          # Patients module
│   │   ├── doctors.js           # Doctors module
│   │   └── appointments.js      # Appointments module
│   │
│   ├── index.html               # Login page
│   ├── dashboard.html
│   ├── patients.html
│   ├── doctors.html
│   └── appointments.html
│
├── screenshots/
│   ├── login.png
│   ├── dashboard.png
│   ├── patients.png
│   ├── doctors.png
│   └── appointments.png
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas or Local MongoDB

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/medicare-hms.git
cd medicare-hms
npm install
```

---

### Step 2 — Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=your_admin_email
```

---

### Step 3 — Seed Database

```bash
npm run seed
```

This creates:
- Sample doctors
- Sample patients
- Sample appointments
- Default admin account from your `.env` configuration

---

### Step 4 — Start the Server

```bash
npm start
```

For development:

```bash
npm run dev
```

---

### Step 5 — Open the App

```bash
http://localhost:5000
```

Use your configured admin credentials to log in.

---

## 🔑 API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| PUT | `/api/auth/change-password` | Change password |

---

### Patients

| Method | Endpoint |
|--------|----------|
| GET | `/api/patients` |
| POST | `/api/patients` |
| GET | `/api/patients/:id` |
| PUT | `/api/patients/:id` |
| DELETE | `/api/patients/:id` |

---

### Doctors

| Method | Endpoint |
|--------|----------|
| GET | `/api/doctors` |
| POST | `/api/doctors` |
| GET | `/api/doctors/:id` |
| PUT | `/api/doctors/:id` |
| DELETE | `/api/doctors/:id` |

---

### Appointments

| Method | Endpoint |
|--------|----------|
| GET | `/api/appointments` |
| POST | `/api/appointments` |
| GET | `/api/appointments/:id` |
| PUT | `/api/appointments/:id` |
| DELETE | `/api/appointments/:id` |
| GET | `/api/appointments/stats` |

---

## ✅ Features

- 🔐 JWT Authentication
- 👤 Patient Management
- 👨‍⚕️ Doctor Management
- 📅 Appointment Scheduling
- 📊 Dashboard Statistics
- 🔍 Real-time Search
- 📱 Responsive Design
- 🛡️ Secure API Protection
- 🎨 Custom UI Design

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs |
| JWT Authentication | jsonwebtoken |
| Rate limiting | express-rate-limit |
| Security headers | Helmet.js |
| Input validation | Mongoose Validators |
| Error handling | Centralized Middleware |

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",       // Password hashing
  "cors": "^2.8.5",           // Cross-Origin requests
  "dotenv": "^16.4.5",        // Environment variables
  "express": "^4.19.2",       // Web framework
  "express-rate-limit": "^7", // Rate limiting
  "helmet": "^7.1.0",         // Security headers
  "jsonwebtoken": "^9.0.2",   // JWT auth
  "mongoose": "^8.4.1",       // MongoDB ODM
  "morgan": "^1.10.0"         // HTTP request logger
}
```

---

## 📸 Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/` | Secure admin login |
| Dashboard | `/dashboard.html` | Stats + recent appointments |
| Patients | `/patients.html` | Full CRUD + search |
| Doctors | `/doctors.html` | Full CRUD + availability filter |
| Appointments | `/appointments.html` | Book + filter + status update |

---

## 📸 Screenshots

### Login Page
<img src="screenshots/login.png" width="100%" />

### Dashboard
<img src="screenshots/dashboard.png" width="100%" />

### Patients
<img src="screenshots/patients.png" width="100%" />

### Doctors
<img src="screenshots/doctors.png" width="100%" />

### Appointments
<img src="screenshots/appointments.png" width="100%" />

---

## 🌐 Deployment

This project can be deployed using:

- Render
- Railway
- Cyclic
- Vercel + Render

Required environment variables:

```env
MONGODB_URI=
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

---

## 🚀 Future Improvements

- Dashboard charts & analytics
- Dark mode
- Role-based access control
- Email notifications
- Appointment calendar
- PDF export reports
- Pagination & advanced filtering

---

## 📄 License

This project is for educational and portfolio purposes.

---

Built with ❤️ for ICT portfolio projects · MediCare HMS © 2026