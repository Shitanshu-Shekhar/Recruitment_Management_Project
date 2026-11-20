# TalentSync - Recruitment Management System (MERN Stack)

A production-ready full-stack Recruitment Management System (RMS) built on the MERN stack with a clean, modern **Light Theme**.

Derived from the industrial training specification and requirements, this platform provides end-to-end recruitment lifecycle operations: job creation and lifecycle management, candidate profile building, secure resume uploads (PDF/DOCX), application tracking with multi-stage status pipelines, and comprehensive administrative oversight.

---

## 🚀 Key Highlights & Features

### 1. 💼 Recruiter Workflow
- **Job Vacancy Management (CRUD):** Create, edit, close, and delete job openings with titles, descriptions, location, job type (Full-time, Part-time, Internship, Contract, Remote), required skills, and deadlines.
- **Ownership Security:** Recruiters can only modify, close, or delete their own job posts.
- **Candidate Pipeline:** View all candidates who applied to each job opening with candidate details, profile information, and secure resume downloads.
- **Stage Progression:** Seamlessly advance applications through stages:
  `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Selected` / `Rejected`.

### 2. 👤 Applicant Experience
- **Profile & Resume:** Build personal profile (phone, degree/education, skills, experience summary) and upload PDF, DOC, or DOCX resumes (validated up to 2 MB).
- **Job Discovery:** Browse active positions with live keyword search (title, description, skills), location filters, and employment type filters with pagination.
- **One-Click Application:** Apply with profile resume or upload a new resume on-the-fly, accompanied by an optional cover letter.
- **Live Status Tracking:** Track application stages in real-time with visual status badges.
- **Withdrawal:** Applicants can withdraw applications while in the `Applied` status.

### 3. 🛡️ Administrator Governance
- **Platform Analytics:** Real-time metrics on total registered users, jobs (open vs. closed), and applications broken down by stage.
- **User Governance:** Inspect all accounts with role filters and search; activate or deactivate accounts with immediate login restriction; delete abusive accounts.
- **Content Moderation:** Remove inappropriate job postings and inspect all platform applications.

### 4. 🎨 Design & Aesthetic
- **Crisp Light Theme:** Built with a clean slate/indigo light palette (`bg-slate-50`, `bg-white`, `border-slate-200`, `text-slate-900`) for high readability and professional ergonomics.
- **Mobile-First Responsiveness:** Fully adaptive UI tested across mobile (360px), tablet (768px), and desktop (1280px+) with collapsible drawer navigation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Context API |
| **Backend** | Node.js, Express.js (REST API Architecture) |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) & bcrypt.js password hashing |
| **File Storage** | Multer disk storage (with randomized secure filenames and authorized streaming) |
| **Security** | Helmet, CORS, Express Rate Limit, NoSQL injection sanitization, input validation |

---

## 📂 Project Directory Structure

```text
Recruitment_Management_Project/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, session
│   │   ├── profileController.js  # Profile management, resume upload, secure file viewing
│   │   ├── jobController.js      # Job CRUD, search, filter, pagination
│   │   ├── applicationController.js # Apply, status pipeline, withdrawal
│   │   └── adminController.js    # Stats, user activation, governance
│   ├── middleware/
│   │   ├── auth.js               # JWT protection middleware
│   │   ├── role.js               # Role-based access control (RBAC)
│   │   ├── upload.js             # Multer resume configuration
│   │   ├── validate.js           # express-validator runner
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # User collection schema
│   │   ├── Profile.js            # Profile collection schema
│   │   ├── Job.js                # Job postings collection schema
│   │   └── Application.js        # Applications collection schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/resumes/          # Secure disk directory for resume files
│   ├── utils/
│   │   ├── generateToken.js      # JWT generator
│   │   └── seedAdmin.js          # Admin & sample demo database seeder
│   ├── .env                      # Environment configuration
│   ├── .env.example              # Example environment template
│   ├── app.js                    # Express app initialization
│   └── server.js                 # Server listener
├── client/
│   ├── src/
│   │   ├── api/axios.js          # Axios client with JWT interceptor & auto-logout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user state & persistence
│   │   │   └── ToastContext.jsx  # Toast notification provider
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with role links
│   │   │   ├── Footer.jsx        # Light-themed footer
│   │   │   ├── JobCard.jsx       # Job card component
│   │   │   ├── StatusBadge.jsx   # Stage and status indicators
│   │   │   ├── FormInput.jsx     # Reusable form controls
│   │   │   ├── Modal.jsx         # Accessible modal dialog
│   │   │   ├── Spinner.jsx       # Loading indicator
│   │   │   ├── EmptyState.jsx    # Zero-data feedback
│   │   │   └── Pagination.jsx    # Clean page navigation
│   │   ├── pages/
│   │   │   ├── public/           # Landing, Login, Register, JobList, JobDetail, 404
│   │   │   ├── applicant/        # ApplicantDashboard, ApplicantProfile
│   │   │   ├── recruiter/        # RecruiterDashboard, JobForm, JobApplications
│   │   │   └── admin/            # AdminDashboard
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx# Role-gated route enforcement
│   │   ├── App.jsx               # Route mappings
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
├── Recruitment_Management_System_API.postman_collection.json # Full Postman suite
└── README.md
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20 LTS or v24
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### 2. Backend Setup
1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify or adjust `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/recruitment_management_db
   JWT_SECRET=super_secret_jwt_key_recruitment_system_2026_production_ready
   JWT_EXPIRES_IN=1d
   CLIENT_URL=http://localhost:5173
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123456
   NODE_ENV=development
   ```
4. Seed the database with the administrator and initial demo dataset:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will start at `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Open a second terminal and navigate to `client`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will launch at `http://localhost:5173`.*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Permissions & Dashboard |
|---|---|---|---|
| **Platform Administrator** | `admin@example.com` | `Admin@123456` | Full system overview, user activation toggle, delete user/jobs |
| **Recruiter** | `recruiter@example.com` | `Recruiter@123` | Post/edit/delete own jobs, review applicants, change status |
| **Job Applicant** | `applicant@example.com` | `Applicant@123` | Build profile, upload resume, search jobs, apply, withdraw |

> *Tip: On the `/login` screen, quick-fill buttons are provided to instantly populate demo credentials with a single click.*

---

## 📡 API Reference Overview

Base URL: `/api`

### Auth (`/api/auth`)
- `POST /register` – Register applicant or recruiter
- `POST /login` – Authenticate user and return signed JWT
- `GET /me` – Fetch current user profile

### Profile (`/api/profile`)
- `GET /me` – Get applicant profile (Applicant)
- `PUT /me` – Update applicant profile (Applicant)
- `POST /resume` – Upload resume file (PDF/DOC/DOCX up to 2 MB) (Applicant)
- `GET /:userId` – View candidate profile (Recruiter/Admin)
- `GET /resume-file/:filename` – Secure resume file download (Owning Applicant, Relevant Recruiter, Admin)

### Jobs (`/api/jobs`)
- `GET /` – Search & filter jobs with pagination (`?q=&location=&jobType=&status=&page=&limit=`)
- `GET /mine` – Recruiter's jobs with applicant counts (Recruiter)
- `GET /:id` – Single job details
- `POST /` – Create new job opening (Recruiter)
- `PUT /:id` – Update job opening (Recruiter owner)
- `DELETE /:id` – Delete job opening (Recruiter owner, Admin)

### Applications (`/api/applications`)
- `POST /:jobId` – Apply to a job with resume and cover letter (Applicant)
- `GET /mine` – View own submitted applications (Applicant)
- `DELETE /:id` – Withdraw application (only while `Applied`) (Applicant)
- `GET /job/:jobId` – View all applications for a job (Recruiter owner)
- `PATCH /:id/status` – Update candidate status stage (Recruiter owner)

### Admin (`/api/admin`)
- `GET /stats` – Platform metrics & application status counts (Admin)
- `GET /users` – List all users with role filtering & search (Admin)
- `PATCH /users/:id/active` – Activate or deactivate user (Admin)
- `DELETE /users/:id` – Delete user and cascade associated records (Admin)
- `GET /jobs` – List all platform jobs (Admin)
- `GET /applications` – List all platform applications (Admin)

---

## 📬 Postman Collection
Import the file:
`Recruitment_Management_System_API.postman_collection.json`
directly into Postman. It contains pre-configured requests, environment variables (`baseUrl`, `adminToken`, `recruiterToken`, `applicantToken`, `jobId`, `applicationId`), and sample JSON payloads.

---

## 🔒 Security Best Practices Implemented
1. **Password Hashing:** Passwords hashed with `bcryptjs` (10 rounds); password hashes excluded by default (`select: false`).
2. **Access Control:** Dual-layer RBAC on both server API routes and client React routes.
3. **Resume Protection:** Resumes stored on disk with randomized unique filenames (`resume-<timestamp>-<hash>.ext`) and served strictly via authorized endpoint checks.
4. **Injection Protection:** NoSQL query sanitizer strips `$` and `.` operators from request payloads.
5. **Rate Limiting:** Protects auth endpoints against brute-force attacks.
