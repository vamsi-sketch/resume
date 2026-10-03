import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { Job, Candidate } from '../types.ts';

interface UploadViewProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onUploadResumes: (files: File[], jobId: string) => Promise<Candidate[]>;
  onLoadSampleResumes: () => Promise<void>;
  onNavigateTab: (tab: 'dashboard' | 'job' | 'upload' | 'results' | 'codebase') => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onUploadResumes,
  onLoadSampleResumes,
  onNavigateTab
}) => {
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['.pdf', '.docx', '.txt'];
    const valid: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (allowed.includes(ext)) {
        valid.push(file);
      } else {
        setErrorMsg(`"${file.name}" ignored: Only PDF and DOCX documents are accepted.`);
      }
    }
    setFileQueue((prev) => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setFileQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (fileQueue.length === 0) return;
    setIsUploading(true);
    setProgressMsg('Extracting resume text via NLP pipeline...');
    setErrorMsg('');

    try {
      await onUploadResumes(fileQueue, selectedJobId);
      setProgressMsg('Extraction and candidate scoring complete!');
      setFileQueue([]);
      setTimeout(() => {
        onNavigateTab('results');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process files. Check server logs.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickDemoLoad = async () => {
    setIsUploading(true);
    setProgressMsg('Loading realistic candidate profiles into screening pipeline...');
    try {
      await onLoadSampleResumes();
      setProgressMsg('Demo candidates loaded and analyzed!');
      setTimeout(() => {
        onNavigateTab('results');
      }, 900);
    } catch (err) {
      setErrorMsg('Failed to load sample resumes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Target Role Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Job Description for Screening
          </label>
          <p className="text-[11px] text-slate-400">
            Uploaded resumes will be scored and ranked against this role's criteria
          </p>
        </div>

        <select
          value={selectedJobId}
          onChange={(e) => onSelectJob(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {jobs.map((job) => (
            <option key={job.job_id} value={job.job_id}>
              {job.title} — {job.department} ({job.experience}+ yrs)
            </option>
          ))}
        </select>
      </div>

      {/* Drag and Drop Zone */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/60'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Drag &amp; Drop Resumes Here, or Click to Browse
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Upload multiple candidate resumes. Supported file formats: <strong>PDF</strong> and <strong>DOCX</strong>.
          </p>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
            Select Files from Computer
          </span>
        </div>

        {/* 1-Click Demo Resumes Loader */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Don't have PDF resumes right now?</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLoad}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>⚡ Load Realistic Sample Resumes</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Processing Indicator */}
        {isUploading && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-800 flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>{progressMsg}</span>
          </div>
        )}

        {/* File Queue List */}
        {fileQueue.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>Ready for Processing ({fileQueue.length} files)</span>
              <button
                type="button"
                onClick={() => setFileQueue([])}
                className="text-red-500 hover:text-red-700 font-normal"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {fileQueue.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                    <span className="text-slate-400 text-[11px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={handleStartUpload}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Extracting & Scoring...' : `Process & Match ${fileQueue.length} Resumes`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
