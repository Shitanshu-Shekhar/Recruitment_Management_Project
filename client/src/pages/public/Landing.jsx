import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Search,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Building2,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/jobs';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'recruiter') return '/recruiter/dashboard';
    return '/applicant/dashboard';
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full-Stack MERN Recruitment Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Streamline Hiring & <span className="text-indigo-600">Land Your Dream Job</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A modern, centralized recruitment management solution. Recruiters post and manage candidate pipelines effortlessly; candidates apply with verified resumes and track application status in real-time.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                  >
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition"
                  >
                    Sign In
                  </Link>
                </>
              )}
              <Link
                to="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              >
                Browse All Open Jobs
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Role-Based Security
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Real-Time Application Status
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Verified Resume Storage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Designed for Recruiters, Applicants & Admins
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Complete end-to-end recruitment lifecycle management without messy email chains and lost spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">For Applicants</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Build your professional profile, upload PDF/DOCX resumes, browse available openings with search and filter, apply with one click, and track status updates live.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">✓ Easy profile management</li>
                <li className="flex items-center gap-1.5">✓ One-click applications</li>
                <li className="flex items-center gap-1.5">✓ Real-time status pipeline</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">For Recruiters</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Post full-time, remote, or internship roles, manage candidate applicants, review resumes securely, and advance candidates through status stages: Review, Shortlist, Select, Reject.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">✓ Full job CRUD with deadlines</li>
                <li className="flex items-center gap-1.5">✓ Candidate screening workflow</li>
                <li className="flex items-center gap-1.5">✓ Direct applicant counts</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">For Administrators</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Comprehensive oversight over all users, jobs, and applications. Monitor platform metrics, manage user activation, and remove inappropriate content cleanly.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">✓ Platform-wide analytics</li>
                <li className="flex items-center gap-1.5">✓ User activation controls</li>
                <li className="flex items-center gap-1.5">✓ Centralized job moderation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Quick Start Box */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Quick Demo Accounts (Ready to Test)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Use any of these pre-seeded demo accounts to test out all role features immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block">Aarav Sharma</span>
                <span className="text-slate-500 text-[11px] block">Job Applicant</span>
                <span className="text-slate-600 font-mono text-[11px] block mt-1">applicant@example.com</span>
                <span className="text-slate-400 font-mono text-[11px]">Applicant@123</span>
              </div>
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <span className="font-bold text-indigo-900 block">Vikram Malhotra</span>
                <span className="text-indigo-600 text-[11px] block">Talent Acquisition Lead</span>
                <span className="text-slate-600 font-mono text-[11px] block mt-1">recruiter@example.com</span>
                <span className="text-slate-400 font-mono text-[11px]">Recruiter@123</span>
              </div>
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <span className="font-bold text-rose-900 block">Rajesh Verma</span>
                <span className="text-rose-600 text-[11px] block">Platform Administrator</span>
                <span className="text-slate-600 font-mono text-[11px] block mt-1">admin@example.com</span>
                <span className="text-slate-400 font-mono text-[11px]">Admin@123456</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
