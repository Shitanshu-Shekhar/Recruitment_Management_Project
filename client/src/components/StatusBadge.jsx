import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  // Application & General Statuses
  const statusStyles = {
    // Applications
    Applied: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
    Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',

    // Job Status
    Open: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Closed: 'bg-slate-100 text-slate-600 border-slate-200',

    // User Active
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Deactivated: 'bg-rose-50 text-rose-700 border-rose-200',

    // Job Types
    'Full-time': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Part-time': 'bg-amber-50 text-amber-700 border-amber-200',
    Internship: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Contract: 'bg-teal-50 text-teal-700 border-teal-200',
    Remote: 'bg-violet-50 text-violet-700 border-violet-200',

    // Roles
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    recruiter: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    applicant: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
