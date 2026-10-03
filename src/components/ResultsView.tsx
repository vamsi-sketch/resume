import React, { useState } from 'react';
import { Search, Filter, Check, X, ArrowUpDown, Award, ExternalLink, ChevronDown } from 'lucide-react';
import { AnalysisResult, Job } from '../types.ts';

interface ResultsViewProps {
  analyses: AnalysisResult[];
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onSelectCandidate: (candidateId: string) => void;
  onUpdateStatus: (candidateId: string, status: string) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  analyses,
  jobs,
  selectedJobId,
  onSelectJob,
  onSelectCandidate,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'name' | 'date'>('score');

  // Filter logic
  const filtered = analyses.filter((item) => {
    // Job filter
    if (selectedJobId && item.job_id !== selectedJobId) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.candidate_name.toLowerCase().includes(q);
      const matchEmail = item.candidate_email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    // Skill filter
    if (skillFilter) {
      const q = skillFilter.toLowerCase();
      const matchSkill = item.matching_skills.some((s) => s.toLowerCase().includes(q));
      if (!matchSkill) return false;
    }

    // Min score
    if (minScore > 0 && item.match_score < minScore) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.match_score - a.match_score;
    if (sortBy === 'experience') return b.candidate_experience - a.candidate_experience;
    if (sortBy === 'name') return a.candidate_name.localeCompare(b.candidate_name);
    return new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, email..."
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Job Filter */}
          <div>
            <select
              value={selectedJobId}
              onChange={(e) => onSelectJob(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="">All Job Roles ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.title} ({j.experience}+ yrs)
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill (e.g. Python)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Min Score Filter */}
          <div>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value={0}>Any Match Score</option>
              <option value={80}>≥ 80% High Match</option>
              <option value={65}>≥ 65% Moderate Match</option>
              <option value={50}>≥ 50% Low/Moderate</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Shortlisted by Recruiter">Shortlisted by Recruiter</option>
              <option value="Review">Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
        </div>

        {/* Results Count & Sort Control */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
          <div className="text-slate-500">
            Showing <strong className="text-slate-900">{sorted.length}</strong> matching candidate evaluations
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-200 rounded bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="score">Match Score (High &rarr; Low)</option>
              <option value="experience">Experience (Years)</option>
              <option value="date">Analysis Date</option>
              <option value="name">Candidate Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Job Match Score</th>
                <th className="px-5 py-3.5">Matching Skills</th>
                <th className="px-5 py-3.5">Missing Skills</th>
                <th className="px-5 py-3.5">Experience</th>
                <th className="px-5 py-3.5">Recruiter Decision</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No candidates matched your search criteria. Try loosening the filters.
                  </td>
                </tr>
              ) : (
                sorted.map((r) => {
                  const scoreClass =
                    r.match_score >= 80
                      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                      : r.match_score >= 65
                      ? 'text-amber-600 bg-amber-50 border-amber-200'
                      : 'text-red-600 bg-red-50 border-red-200';

                  const progressBg =
                    r.match_score >= 80
                      ? 'bg-emerald-500'
                      : r.match_score >= 65
                      ? 'bg-amber-500'
                      : 'bg-red-500';

                  return (
                    <tr key={r.analysis_id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Candidate Name & Role */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{r.candidate_name}</div>
                        <div className="text-[11px] text-slate-400">{r.candidate_email}</div>
                        <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                          Role: {r.job_title}
                        </div>
                      </td>

                      {/* Match Score Gauge */}
                      <td className="px-5 py-4 min-w-[130px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreClass}`}
                          >
                            {r.match_score}%
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {r.match_score >= 80 ? 'High' : r.match_score >= 65 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressBg}`}
                            style={{ width: `${r.match_score}%` }}
                          />
                        </div>
                      </td>

                      {/* Matching Skills */}
                      <td className="px-5 py-4 max-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {r.matching_skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              <Check className="w-3 h-3" />
                              <span>{s}</span>
                            </span>
                          ))}
                          {r.matching_skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{r.matching_skills.length - 4} more
                            </span>
                          )}
                          {r.matching_skills.length === 0 && (
                            <span className="text-slate-400 text-[11px]">No match</span>
                          )}
                        </div>
                      </td>

                      {/* Missing Skills */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {r.missing_skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200"
                            >
                              <X className="w-3 h-3" />
                              <span>{s}</span>
                            </span>
                          ))}
                          {r.missing_skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{r.missing_skills.length - 3}
                            </span>
                          )}
                          {r.missing_skills.length === 0 && (
                            <span className="text-emerald-600 font-medium text-[11px]">
                              All skills met
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {r.candidate_experience} yrs
                      </td>

                      {/* Recruiter Decision Status */}
                      <td className="px-5 py-4">
                        <select
                          value={r.status}
                          onChange={(e) => onUpdateStatus(r.candidate_id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                          <option value="Review">Review</option>
                          <option value="Shortlisted by Recruiter">Shortlisted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Hold">Hold</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onSelectCandidate(r.candidate_id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
