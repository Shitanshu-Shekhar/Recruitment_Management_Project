import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  UserX,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'jobs' | 'applications'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users tab state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Jobs tab state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Applications tab state
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Action modals
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'toggleUser' | 'deleteUser' | 'deleteJob'
    item: null,
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      toast.error('Failed to load administrative statistics');
    } finally {
      setLoadingStats(false);
    }
  }, [toast]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userSearch.trim()) params.append('q', userSearch.trim());

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearch, toast]);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const res = await api.get('/admin/jobs');
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      toast.error('Failed to load platform jobs');
    } finally {
      setLoadingJobs(false);
    }
  }, [toast]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      const res = await api.get('/admin/applications');
      if (res.data?.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      toast.error('Failed to load platform applications');
    } finally {
      setLoadingApplications(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab, fetchUsers, fetchJobs, fetchApplications]);

  const handleActionConfirm = async () => {
    const { type, item } = actionModal;
    if (!item) return;

    try {
      setSubmittingAction(true);

      if (type === 'toggleUser') {
        const res = await api.patch(`/admin/users/${item._id}/active`);
        if (res.data?.success) {
          toast.success(res.data.message);
          fetchUsers();
          fetchStats();
        }
      } else if (type === 'deleteUser') {
        const res = await api.delete(`/admin/users/${item._id}`);
        if (res.data?.success) {
          toast.success(res.data.message);
          fetchUsers();
          fetchStats();
        }
      } else if (type === 'deleteJob') {
        const res = await api.delete(`/jobs/${item._id}`);
        if (res.data?.success) {
          toast.success('Job removed by administrator');
          fetchJobs();
          fetchStats();
        }
      }

      setActionModal({ isOpen: false, type: null, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Platform Administration
              </h1>
              <p className="text-xs text-slate-500">
                System monitoring, role governance, user activation, and content moderation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              Administrator: {currentAdmin?.name}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics & Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            User Governance
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Job Postings
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Applications Pipeline
          </button>
        </div>

        {/* TAB 1: Analytics & Stats */}
        {activeTab === 'stats' && (
          <div>
            {loadingStats ? (
              <div className="py-16">
                <Spinner size="lg" text="Fetching platform analytics..." />
              </div>
            ) : !stats ? (
              <div className="text-center py-12 text-slate-500 text-xs">No stats available.</div>
            ) : (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {stats.totalApplicants} Applicants • {stats.totalRecruiters} Recruiters
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-indigo-200/60 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Total Jobs</span>
                    <div className="text-2xl font-black text-indigo-700 mt-1">{stats.totalJobs}</div>
                    <div className="text-[11px] text-indigo-600 mt-1">
                      {stats.openJobs} Open • {stats.closedJobs} Closed
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Applications</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">{stats.totalApplications}</div>
                    <div className="text-[11px] text-emerald-600 mt-1">Submitted platform-wide</div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-purple-200/60 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Shortlisted Candidates</span>
                    <div className="text-2xl font-black text-purple-700 mt-1">
                      {stats.statusBreakdown?.Shortlisted || 0}
                    </div>
                    <div className="text-[11px] text-purple-600 mt-1">
                      {stats.statusBreakdown?.Selected || 0} Selected for hire
                    </div>
                  </div>
                </div>

                {/* Pipeline Breakdown Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Application Status Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(stats.statusBreakdown || {}).map(([stage, count]) => (
                      <div key={stage} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 text-center">
                        <StatusBadge status={stage} />
                        <div className="text-xl font-extrabold text-slate-800 mt-2">{count}</div>
                        <span className="text-[11px] text-slate-400 font-medium">candidates</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: User Governance */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Filter bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="applicant">Applicants</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                {users.length} users registered
              </span>
            </div>

            {loadingUsers ? (
              <div className="py-16">
                <Spinner size="lg" text="Loading users..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">User</th>
                      <th scope="col" className="px-6 py-3.5">Role</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5">Joined Date</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelf = u._id === currentAdmin?._id;
                      return (
                        <tr key={u._id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-slate-500 text-[11px]">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={u.role} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={u.isActive ? 'Active' : 'Deactivated'} />
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-400 italic">Current User</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      isOpen: true,
                                      type: 'toggleUser',
                                      item: u,
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                    u.isActive
                                      ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                      : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() =>
                                    setActionModal({
                                      isOpen: true,
                                      type: 'deleteUser',
                                      item: u,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: All Jobs */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">All Platform Jobs ({jobs.length})</h3>
            </div>

            {loadingJobs ? (
              <div className="py-16">
                <Spinner size="lg" text="Loading jobs..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Job Title & Recruiter</th>
                      <th scope="col" className="px-6 py-3.5">Location & Type</th>
                      <th scope="col" className="px-6 py-3.5">Deadline</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5">Applicants</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((j) => (
                      <tr key={j._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{j.title}</div>
                          <div className="text-slate-500 text-[11px]">{j.recruiter?.name} ({j.recruiter?.email})</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{j.location}</div>
                          <span className="inline-block mt-0.5">
                            <StatusBadge status={j.jobType} />
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(j.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={j.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-700">
                          {j.applicantCount || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: 'deleteJob',
                                item: j,
                              })
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: All Applications */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                All Applications Pipeline ({applications.length})
              </h3>
            </div>

            {loadingApplications ? (
              <div className="py-16">
                <Spinner size="lg" text="Loading applications..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">Candidate</th>
                      <th scope="col" className="px-6 py-3.5">Target Job</th>
                      <th scope="col" className="px-6 py-3.5">Recruiter</th>
                      <th scope="col" className="px-6 py-3.5">Status</th>
                      <th scope="col" className="px-6 py-3.5">Applied Date</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{a.applicant?.name}</div>
                          <div className="text-slate-500 text-[11px]">{a.applicant?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {a.job?.title || 'Unknown Job'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {a.job?.recruiter?.name || 'Recruiter'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(a.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/api/profile/resume-file/${a.resumeUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            File
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: null, item: null })}
        title={
          actionModal.type === 'toggleUser'
            ? `${actionModal.item?.isActive ? 'Deactivate' : 'Activate'} User`
            : actionModal.type === 'deleteUser'
            ? 'Delete User Account'
            : 'Delete Job Posting'
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            {actionModal.type === 'toggleUser' && (
              <>
                Are you sure you want to{' '}
                <strong className="text-slate-900">
                  {actionModal.item?.isActive ? 'deactivate' : 'activate'}
                </strong>{' '}
                user <strong>{actionModal.item?.name}</strong>? Deactivated users are blocked from logging in.
              </>
            )}

            {actionModal.type === 'deleteUser' && (
              <>
                Are you sure you want to permanently delete user{' '}
                <strong className="text-slate-900">{actionModal.item?.name}</strong>? This will cascade delete their profile, jobs, and applications.
              </>
            )}

            {actionModal.type === 'deleteJob' && (
              <>
                Are you sure you want to delete job posting{' '}
                <strong className="text-slate-900">{actionModal.item?.title}</strong>? All applications submitted for this job will also be removed.
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setActionModal({ isOpen: false, type: null, item: null })}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleActionConfirm}
              disabled={submittingAction}
              className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 ${
                actionModal.type === 'toggleUser' && !actionModal.item?.isActive
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submittingAction ? 'Processing...' : 'Confirm Action'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
