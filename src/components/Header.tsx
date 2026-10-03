import React from 'react';
import { Plus, Upload, RotateCcw } from 'lucide-react';
import { Job } from '../types.ts';

interface HeaderProps {
  title: string;
  subtitle?: string;
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  jobs,
  selectedJobId,
  onSelectJob,
  onOpenUpload,
  onOpenNewJob,
  onResetDemo
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Active Target Job Selector */}
        {jobs.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Active Role:</span>
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJob(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title} ({job.experience}+ yrs)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Actions */}
        <button
          onClick={onResetDemo}
          title="Reset to initial showcase state with sample data"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>

        <button
          onClick={onOpenNewJob}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Job</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Resumes</span>
        </button>
      </div>
    </header>
  );
};
