import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, ClipboardList, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const demoJobs = [
  { title: 'Senior React Developer', team: 'Product Engineering', applicants: 28, status: 'Open' },
  { title: 'Product Designer', team: 'Design', applicants: 17, status: 'Reviewing' },
  { title: 'Talent Acquisition Partner', team: 'People', applicants: 12, status: 'Open' },
];

const pipeline = [
  { label: 'Applied', count: 42, color: 'bg-slate-400' },
  { label: 'Under review', count: 18, color: 'bg-blue-500' },
  { label: 'Shortlisted', count: 9, color: 'bg-violet-500' },
  { label: 'Selected', count: 4, color: 'bg-emerald-500' },
];

const DemoDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <strong>Presentation demo.</strong> The figures below are sample data. Accounts are saved only in this browser; this demo does not connect to a live database.
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Demo workspace · {user?.role}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Welcome, {user?.name || 'there'}
            </h1>
            <p className="mt-2 text-slate-600">A preview of the recruitment activity dashboard.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:self-auto">
            Explore TalentSync <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <section aria-label="Recruitment overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Open positions</span><BriefcaseBusiness className="h-5 w-5 text-indigo-600" /></div>
            <p className="mt-4 text-3xl font-bold text-slate-900">12</p><p className="mt-1 text-xs text-emerald-700">3 added this month</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Active candidates</span><Users className="h-5 w-5 text-blue-600" /></div>
            <p className="mt-4 text-3xl font-bold text-slate-900">84</p><p className="mt-1 text-xs text-slate-500">Across all open roles</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>In review</span><ClipboardList className="h-5 w-5 text-violet-600" /></div>
            <p className="mt-4 text-3xl font-bold text-slate-900">18</p><p className="mt-1 text-xs text-slate-500">Ready for recruiter feedback</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Hires this month</span><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <p className="mt-4 text-3xl font-bold text-slate-900">4</p><p className="mt-1 text-xs text-emerald-700">2 roles filled</p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div><h2 className="font-bold text-slate-900">Recent openings</h2><p className="mt-1 text-xs text-slate-500">Sample positions in the hiring pipeline</p></div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">3 featured</span>
            </div>
            <div className="divide-y divide-slate-100">
              {demoJobs.map((job) => (
                <div key={job.title} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="font-semibold text-slate-900">{job.title}</h3><p className="mt-1 text-sm text-slate-500">{job.team} · {job.applicants} applicants</p></div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{job.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Candidate pipeline</h2>
            <p className="mt-1 text-xs text-slate-500">Applications by current stage</p>
            <div className="mt-6 space-y-5">
              {pipeline.map((stage) => (
                <div key={stage.label}>
                  <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{stage.label}</span><span className="font-semibold text-slate-900">{stage.count}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${stage.color}`} style={{ width: `${Math.round((stage.count / 42) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
