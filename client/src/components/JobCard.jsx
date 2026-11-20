import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, Users, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

const JobCard = ({ job, isRecruiterView = false, onEdit, onDelete }) => {
  const isExpired = job.isExpired || (job.deadline && new Date(job.deadline) < new Date());
  const effectiveStatus = isExpired ? 'Closed' : job.status;

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
              <Link to={`/jobs/${job._id}`}>{job.title}</Link>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Posted by {job.recruiter?.name || 'Recruiter'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={job.jobType} />
            <StatusBadge status={effectiveStatus} />
          </div>
        </div>

        {/* Location & Deadline info */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Deadline: {formattedDeadline}</span>
          </div>
          {isRecruiterView && (
            <div className="flex items-center gap-1.5 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <Users className="w-3.5 h-3.5" />
              <span>{job.applicantCount || 0} Applicants</span>
            </div>
          )}
        </div>

        {/* Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[11px]">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {isRecruiterView ? (
          <div className="flex items-center justify-between w-full">
            <Link
              to={`/recruiter/jobs/${job._id}/applications`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              View Applicants ({job.applicantCount || 0}) →
            </Link>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(job)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(job._id)}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400">
              {effectiveStatus === 'Closed' ? 'Applications closed' : 'Accepting candidates'}
            </span>
            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              View Job & Apply
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
