import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import JobList from './pages/public/JobList';
import JobDetail from './pages/public/JobDetail';
import NotFound from './pages/public/NotFound';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import ApplicantProfile from './pages/applicant/ApplicantProfile';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobForm from './pages/recruiter/JobForm';
import JobApplications from './pages/recruiter/JobApplications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Main Application Layout Shell
const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Pages within common layout */}
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated routes (available to any logged in user) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/jobs" element={<JobList />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
              </Route>

              {/* Applicant Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['applicant']} />}>
                <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
                <Route path="/applicant/profile" element={<ApplicantProfile />} />
              </Route>

              {/* Recruiter Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/jobs/new" element={<JobForm />} />
                <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
                <Route path="/recruiter/jobs/:id/applications" element={<JobApplications />} />
              </Route>

              {/* Admin Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
