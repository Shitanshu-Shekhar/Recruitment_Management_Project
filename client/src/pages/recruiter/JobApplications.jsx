import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  Users,
  FileText,
  ExternalLink,
  Phone,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Eye,
  Mail
} from 'lucide-react';

const JobApplications = () => {
  const { id: jobId } = useParams();
  const [jobTitle, setJobTitle] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // Candidate detail modal
  const [updatingId, setUpdatingId] = useState(null);

  const toast = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}`);
      if (res.data?.success) {
        setJobTitle(res.data.jobTitle || 'Job Applications');
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch job applications');
    } finally {
      setLoading(false);
    }
  }, [jobId, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Status updated to '${newStatus}'`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading candidate applications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/recruiter/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Recruiter Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
              <Users className="w-4 h-4" />
              <span>Candidate Pipeline</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Applicants for: {jobTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing all candidates who submitted applications for this role.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              {applications.length} Total Candidates
            </span>
          </div>
        </div>

        {/* Applications Table */}
        {applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="No candidates have applied to this job posting so far. Check back soon!"
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Candidate</th>
                    <th scope="col" className="px-6 py-4">Resume</th>
                    <th scope="col" className="px-6 py-4">Applied Date</th>
                    <th scope="col" className="px-6 py-4">Current Status</th>
                    <th scope="col" className="px-6 py-4">Update Stage</th>
                    <th scope="col" className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/70 transition">
                      {/* Candidate Name & Email */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {app.applicant?.name || 'Anonymous Candidate'}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {app.applicant?.email}
                        </div>
                      </td>

                      {/* Resume Link */}
                      <td className="px-6 py-4">
                        {app.resumeUrl ? (
                          <a
                            href={`/api/profile/resume-file/${app.resumeUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-medium transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Resume
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No resume</span>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Current Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Update Stage Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 text-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Profile & Application Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Candidate Profile - ${selectedApp.applicant?.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedApp.applicant?.name}</h4>
                <p className="text-slate-500 text-xs">{selectedApp.applicant?.email}</p>
                {selectedApp.profile?.phone && (
                  <p className="text-slate-600 text-xs mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedApp.profile.phone}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[11px] text-slate-400">Current Pipeline Stage</span>
                <div className="mt-1">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
            </div>

            {/* Education & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
                </span>
                <p className="text-slate-600">
                  {selectedApp.profile?.education || 'No education provided.'}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> Experience
                </span>
                <p className="text-slate-600">
                  {selectedApp.profile?.experience || 'No experience summary provided.'}
                </p>
              </div>
            </div>

            {/* Candidate Skills */}
            {selectedApp.profile?.skills && selectedApp.profile.skills.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 block mb-2">Candidate Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume file link */}
            <div>
              <span className="font-bold text-slate-700 block mb-1">Verified Resume Document</span>
              {selectedApp.resumeUrl ? (
                <a
                  href={`/api/profile/resume-file/${selectedApp.resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition"
                >
                  <FileText className="w-4 h-4" />
                  {selectedApp.resumeUrl}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-400 italic">No resume attached</span>
              )}
            </div>

            {/* Cover letter */}
            <div>
              <span className="font-bold text-slate-700 block mb-1">Cover Letter</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedApp.coverLetter || 'No cover letter submitted.'}
              </div>
            </div>

            {/* Update status directly inside modal */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Change Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleStatusChange(selectedApp._id, newStatus);
                    setSelectedApp({ ...selectedApp, status: newStatus });
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JobApplications;
