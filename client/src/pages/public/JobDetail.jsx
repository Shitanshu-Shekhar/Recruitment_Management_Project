import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import FormInput from '../../components/FormInput';
import {
  MapPin,
  Calendar,
  Briefcase,
  User,
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Building,
  Clock
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeOption, setResumeOption] = useState('profile'); // 'profile' or 'upload'
  const [profileResumeUrl, setProfileResumeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      if (res.data?.success) {
        setJob(res.data.job);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // If user is applicant, check their existing profile resume
  useEffect(() => {
    fetchJobDetails();

    if (isAuthenticated && user?.role === 'applicant') {
      api.get('/profile/me')
        .then((res) => {
          if (res.data?.profile?.resumeUrl) {
            setProfileResumeUrl(res.data.profile.resumeUrl);
            setResumeOption('profile');
          } else {
            setResumeOption('upload');
          }
        })
        .catch(() => {});
    }
  }, [fetchJobDetails, isAuthenticated, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      let resumeUrlToUse = profileResumeUrl;

      // If user chose to upload a new resume
      if (resumeOption === 'upload') {
        if (!selectedFile) {
          toast.error('Please choose a resume file (PDF, DOC, DOCX up to 2 MB)');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('resume', selectedFile);

        const uploadRes = await api.post('/profile/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data?.success) {
          resumeUrlToUse = uploadRes.data.resumeUrl;
        } else {
          toast.error('Resume upload failed.');
          setSubmitting(false);
          return;
        }
      }

      if (!resumeUrlToUse) {
        toast.error('A resume is required to submit your application.');
        setSubmitting(false);
        return;
      }

      // Submit application
      const res = await api.post(`/applications/${id}`, {
        coverLetter,
        resumeUrl: resumeUrlToUse
      });

      if (res.data?.success) {
        toast.success('Your application was submitted successfully!');
        setIsApplyModalOpen(false);
        fetchJobDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading job information..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Job Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'The job you requested could not be located.'}</p>
          <Link
            to="/jobs"
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Job Openings
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.isExpired || (job.deadline && new Date(job.deadline) < new Date());
  const effectiveStatus = isExpired ? 'Closed' : job.status;
  const canApply = isAuthenticated && user?.role === 'applicant' && effectiveStatus === 'Open' && !job.hasApplied;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Listings
          </Link>
        </div>

        {/* Job Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge status={job.jobType} />
                <StatusBadge status={effectiveStatus} />
                {job.hasApplied && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Applied ({job.applicationStatus || 'Applied'})
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                Posted by {job.recruiter?.name || 'Recruiter'}
              </p>
            </div>

            {/* Apply Button on Header */}
            <div>
              {user?.role === 'applicant' && (
                <>
                  {job.hasApplied ? (
                    <div className="text-right">
                      <span className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Application Submitted
                      </span>
                      <Link
                        to="/applicant/dashboard"
                        className="block text-[11px] text-indigo-600 hover:underline mt-1"
                      >
                        Track in Dashboard →
                      </Link>
                    </div>
                  ) : effectiveStatus === 'Closed' ? (
                    <span className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Applications Closed
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
                    >
                      Apply Now
                    </button>
                  )}
                </>
              )}

              {user?.role === 'recruiter' && (
                <div className="text-xs text-slate-400 italic">
                  Recruiter viewing post
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  Admin Inspection Mode
                </div>
              )}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  Log in to Apply
                </Link>
              )}
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Location</span>
                <span className="font-semibold text-slate-800">{job.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Deadline</span>
                <span className="font-semibold text-slate-800">
                  {new Date(job.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Job Type</span>
                <span className="font-semibold text-slate-800">{job.jobType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            About the Role
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Apply Card */}
        {canApply && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                Ready to take the next step in your career?
              </h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Submit your profile and resume directly to {job.recruiter?.name || 'the recruiter'}.
              </p>
            </div>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
            >
              Apply for this Job
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Your application will be sent to <span className="font-semibold text-slate-700">{job.recruiter?.name}</span> for review.
          </p>

          {/* Resume Selection */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resume Attachment <span className="text-rose-500">*</span>
            </span>

            {profileResumeUrl && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="resumeOpt"
                  checked={resumeOption === 'profile'}
                  onChange={() => setResumeOption('profile')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Use resume from profile: <strong className="font-mono text-slate-800">{profileResumeUrl}</strong></span>
              </label>
            )}

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="resumeOpt"
                checked={resumeOption === 'upload'}
                onChange={() => setResumeOption('upload')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Upload a new resume file (PDF, DOC, DOCX - max 2 MB)</span>
            </label>

            {resumeOption === 'upload' && (
              <div className="pt-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Accepted formats: .pdf, .doc, .docx. Maximum size: 2 MB.
                </span>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <FormInput
            label="Cover Letter (Optional)"
            name="coverLetter"
            type="textarea"
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the hiring team why you are a great match for this position..."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;
