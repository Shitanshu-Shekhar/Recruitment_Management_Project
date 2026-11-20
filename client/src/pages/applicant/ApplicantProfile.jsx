import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import Spinner from '../../components/Spinner';
import {
  User,
  Phone,
  GraduationCap,
  Briefcase,
  Code2,
  FileText,
  Upload,
  CheckCircle,
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';

const ApplicantProfile = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form fields
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      if (res.data?.success && res.data.profile) {
        const p = res.data.profile;
        setPhone(p.phone || '');
        setEducation(p.education || '');
        setExperience(p.experience || '');
        setSkillsInput((p.skills || []).join(', '));
        setResumeUrl(p.resumeUrl || '');
      }
    } catch (err) {
      toast.error('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formattedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.put('/profile/me', {
        phone,
        education,
        experience,
        skills: formattedSkills,
        resumeUrl
      });

      if (res.data?.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload (PDF, DOC, DOCX up to 2 MB)');
      return;
    }

    // Client-side file size check (2 MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds the 2 MB maximum limit');
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await api.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setResumeUrl(res.data.resumeUrl);
        setSelectedFile(null);
        toast.success('Resume uploaded and attached to your profile!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Resume upload failed';
      toast.error(msg);
    } finally {
      setUploadingResume(false);
    }
  };

  const parsedSkills = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" text="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Applicant Profile & Resume
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your credentials up to date so recruiters can evaluate your fit accurately.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Account Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-lg flex items-center justify-center">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Applicant Account
                </span>
              </div>
            </div>
          </div>

          {/* Resume Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Resume Document
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload your resume in PDF, DOC, or DOCX format (maximum 2 MB). This resume will be automatically attached when you apply for open roles.
            </p>

            {/* Current Resume Banner */}
            {resumeUrl ? (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Current Active Resume</span>
                    <span className="text-[11px] font-mono text-emerald-700">{resumeUrl}</span>
                  </div>
                </div>
                <a
                  href={`/api/profile/resume-file/${resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            ) : (
              <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>No resume uploaded yet. Please upload one below to apply for positions.</span>
              </div>
            )}

            {/* Upload File Form */}
            <form onSubmit={handleResumeUpload} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              <button
                type="submit"
                disabled={uploadingResume || !selectedFile}
                className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Professional Profile Details
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Contact Phone Number"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />

                <FormInput
                  label="Education / Degree"
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                />
              </div>

              <div>
                <FormInput
                  label="Skills (Comma-separated)"
                  id="skills"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Node.js, Express, MongoDB, Tailwind CSS, Python"
                  helper="Separate individual skills with commas"
                />

                {/* Live Skills Preview Chips */}
                {parsedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {parsedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <FormInput
                label="Experience Summary"
                id="experience"
                type="textarea"
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Highlight your previous work history, roles, key accomplishments and domain expertise..."
              />

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfile;
