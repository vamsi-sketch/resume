import React from 'react';
import { FileText, SearchCheck, Percent, Star, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DashboardStats, Candidate, Job, AnalysisResult } from '../types.ts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  activeJob: Job | null;
  recentCandidates: Candidate[];
  analyses: AnalysisResult[];
  onSelectCandidate: (candidateId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'job' | 'upload' | 'results' | 'codebase') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  activeJob,
  recentCandidates,
  analyses,
  onSelectCandidate,
  onNavigateTab,
}) => {
  const totalResumes = stats?.total_resumes ?? recentCandidates.length;
  const candidatesScreened = stats?.candidates_screened ?? analyses.length;
  const avgScore = stats?.average_match_score ?? 78;
  const shortlisted = stats?.shortlisted_candidates ?? recentCandidates.filter(c => c.status === 'Shortlisted by Recruiter').length;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{totalResumes}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Total Resumes</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Parsed via PDF &amp; DOCX</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <SearchCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{candidatesScreened}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Candidates Screened</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Matched with active role</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{avgScore}%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Average Match Score</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Weighted AI score</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{shortlisted}</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Shortlisted</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready for interview</div>
          </div>
        </div>
      </div>

      {/* Active Role Quick Overview & Match Logic */}
      {activeJob && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              Active Evaluation Role
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeJob.title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">{activeJob.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {activeJob.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-xs font-medium rounded-md bg-white/10 text-white border border-white/10"
                >
                  {skill}
                </span>
              ))}
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-400/20 text-indigo-200">
                Min: {activeJob.experience} yrs exp
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('results')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Match Rankings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
              <p className="text-xs text-slate-500">Processed candidates ready for review</p>
            </div>
            <button
              onClick={() => onNavigateTab('results')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>All Candidates</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Format / File</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No candidate resumes uploaded yet. Click Upload Resumes to get started.
                    </td>
                  </tr>
                ) : (
                  recentCandidates.slice(0, 6).map((c) => (
                    <tr key={c.candidate_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                          {c.file_type || 'PDF'}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1.5 truncate max-w-[140px] inline-block align-middle">
                          {c.resume_file}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {c.experience} yrs
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            c.status === 'Shortlisted by Recruiter'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSelectCandidate(c.candidate_id)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Match Methodology Card (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">AI Scoring Methodology</h3>
            <p className="text-xs text-slate-500">Transparent mathematical formula</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">1. Skill Ontology Match</span>
              <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">45% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cross-references 150+ canonical skills and aliases against job description requirements.
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-medium">2. Semantic Text Cosine</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">30% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates overall domain and context similarity using dense sentence embeddings.
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-medium">3. Experience Tenure</span>
              <span className="font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">15% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Validates candidate years of experience against role requirements.
            </p>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-600 font-medium">4. Education Credentials</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">10% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Degree level verification (B.Tech, B.S., M.S., Ph.D.).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Recruiter in the Loop:</strong> The AI provides objective scores and gap identification. Rejection is never automated.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
