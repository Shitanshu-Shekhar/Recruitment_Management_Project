import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import Spinner from '../../components/Spinner';
import { ArrowLeft, Briefcase, Save, Sparkles } from 'lucide-react';

const JobForm = () => {
  const { id } = useParams(); // If id exists, it's Edit mode; otherwise Create mode
  const isEdit = Boolean(id);

  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [skillsInput, setSkillsInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Open');

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${id}`)
        .then((res) => {
          if (res.data?.success && res.data.job) {
            const j = res.data.job;
            setTitle(j.title || '');
            setDescription(j.description || '');
            setLocation(j.location || '');
            setJobType(j.jobType || 'Full-time');
            setSkillsInput((j.skills || []).join(', '));
            if (j.deadline) {
              setDeadline(new Date(j.deadline).toISOString().split('T')[0]);
            }
            setStatus(j.status || 'Open');
          }
        })
        .catch((err) => {
          const msg = err.response?.data?.message || 'Failed to load job details';
          setError(msg);
          toast.error(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !location.trim() || !deadline) {
      setError('Please fill in all required fields marked with an asterisk (*).');
      return;
    }

    try {
      setSubmitting(true);
      const formattedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        jobType,
        skills: formattedSkills,
        deadline,
        status
      };

      if (isEdit) {
        const res = await api.put(`/jobs/${id}`, payload);
        if (res.data?.success) {
          toast.success('Job posting updated successfully!');
          navigate('/recruiter/dashboard');
        }
      } else {
        const res = await api.post('/jobs', payload);
        if (res.data?.success) {
          toast.success('New job posted successfully!');
          navigate('/recruiter/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save job posting';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const parsedSkills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading job data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {isEdit ? 'Edit Job Posting' : 'Create New Job Opening'}
              </h1>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Update vacancy details and application requirements'
                  : 'Publish a new role to find candidates for your team'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Job Title"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Location"
                id="location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
              />

              <FormInput
                label="Employment Type"
                id="jobType"
                type="select"
                required
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                options={[
                  'Full-time',
                  'Part-time',
                  'Internship',
                  'Contract',
                  'Remote'
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Application Deadline"
                id="deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <FormInput
                label="Job Status"
                id="status"
                type="select"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={['Open', 'Closed']}
              />
            </div>

            <div>
              <FormInput
                label="Required Skills (Comma-separated)"
                id="skills"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Node.js, Express, MongoDB, TypeScript"
                helper="List technologies or qualifications candidates should possess"
              />

              {parsedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <FormInput
              label="Full Job Description"
              id="description"
              type="textarea"
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline responsibilities, prerequisites, day-to-day duties, benefits, and team culture..."
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/recruiter/dashboard"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saving...' : isEdit ? 'Update Job' : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
