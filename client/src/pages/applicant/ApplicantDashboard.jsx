import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // For cover letter / details modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const toast = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/mine');
      if (res.data?.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdrawConfirm = async () => {
    if (!appToWithdraw) return;

    try {
      setWithdrawing(true);
      const res = await api.delete(`/applications/${appToWithdraw._id}`);
      if (res.data?.success) {
        toast.success('Application withdrawn successfully');
        setIsWithdrawModalOpen(false);
        setAppToWithdraw(null);
        fetchApplications();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to withdraw application';
      toast.error(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  // Compute quick stats
  const totalApps = applications.length;
  const underReview = applications.filter((a) => a.status === 'Under Review').length;
  const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
  const selected = applications.filter((a) => a.status === 'Selected').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Job Applications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the progress and review stages of all your job submissions.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            Explore More Jobs
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Applied</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalApps}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Under Review</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{underReview}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-purple-200/60 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Shortlisted</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{shortlisted}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Selected</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{selected}</div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-16">
            <Spinner size="lg" text="Loading your application status..." />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications submitted yet"
            description="You haven't applied for any positions yet. Start searching jobs and submit your resume."
            action={
              <Link
                to="/jobs"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Browse Job Openings
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Job Title & Company</th>
                    <th scope="col" className="px-6 py-4">Location & Type</th>
                    <th scope="col" className="px-6 py-4">Applied Date</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition">
                      {/* Job Title */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.job ? (
                            <Link to={`/jobs/${app.job._id}`} className="hover:text-indigo-600">
                              {app.job.title}
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">Job no longer active</span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {app.job?.recruiter?.name || 'Recruiter'}
                        </div>
                      </td>

                      {/* Location & Type */}
                      <td className="px-6 py-4 text-slate-600">
                        <div>{app.job?.location || 'N/A'}</div>
                        <span className="inline-block mt-1">
                          <StatusBadge status={app.job?.jobType} />
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            title="View details"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Withdraw button (only if Applied) */}
                          {app.status === 'Applied' && (
                            <button
                              onClick={() => {
                                setAppToWithdraw(app);
                                setIsWithdrawModalOpen(true);
                              }}
                              title="Withdraw application"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Details - ${selectedApp.job?.title || 'Job'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 font-medium block">Current Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-medium block">Applied On</span>
                <span className="text-slate-700 font-semibold mt-1 block">
                  {new Date(selectedApp.appliedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Attached Resume</span>
              <a
                href={`/api/profile/resume-file/${selectedApp.resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition"
              >
                <FileText className="w-4 h-4" />
                {selectedApp.resumeUrl}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Submitted Cover Letter</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedApp.coverLetter || 'No cover letter submitted.'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Job Application"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to withdraw your application for{' '}
            <strong className="text-slate-900">{appToWithdraw?.job?.title}</strong>? Once withdrawn, your application will be removed from the recruiter's active pipeline.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Keep Application
            </button>
            <button
              type="button"
              onClick={handleWithdrawConfirm}
              disabled={withdrawing}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
            >
              {withdrawing ? 'Withdrawing...' : 'Confirm Withdraw'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicantDashboard;
