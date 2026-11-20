import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import JobCard from '../../components/JobCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import {
  Briefcase,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchMyJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/mine');
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      toast.error('Failed to load your posted jobs');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/jobs/${jobToDelete}`);
      if (res.data?.success) {
        toast.success('Job posting and associated applications removed');
        setDeleteModalOpen(false);
        setJobToDelete(null);
        fetchMyJobs();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete job';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditJob = (job) => {
    navigate(`/recruiter/jobs/${job._id}/edit`);
  };

  // Stats calculation
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === 'Open').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Job Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your active vacancies, review applicant submissions and update candidate status.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Jobs Posted</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalJobs}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active Openings</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{openJobs}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-indigo-200/60 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Total Candidates Received</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">{totalApplicants}</div>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="py-16">
            <Spinner size="lg" text="Loading your job postings..." />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="You haven't posted any jobs yet"
            description="Create your first job posting to start receiving applications from candidates."
            action={
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Post a Job Now
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isRecruiterView={true}
                onEdit={handleEditJob}
                onDelete={(id) => {
                  setJobToDelete(id);
                  setDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete Job"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete this job posting? All candidate applications submitted for this job will also be removed permanently.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;
