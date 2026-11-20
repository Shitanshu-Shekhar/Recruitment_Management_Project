import React from 'react';
import { Briefcase, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">
              TalentSync RMS
            </span>
            <span className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500">
            <Link to="/jobs" className="hover:text-indigo-600 transition">
              Find Jobs
            </Link>
            <Link to="/login" className="hover:text-indigo-600 transition">
              Recruiter Portal
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
