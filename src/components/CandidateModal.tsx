import React from 'react';
import { X, Check, Mail, Phone, FileText, Briefcase, GraduationCap, Award, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Candidate, AnalysisResult } from '../types.ts';

interface CandidateModalProps {
  candidate: Candidate | null;
  analysis: AnalysisResult | null;
  onClose: () => void;
  onUpdateStatus: (candidateId: string, status: string) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  analysis,
  onClose,
  onUpdateStatus,
}) => {
  if (!candidate) return null;

  const currentStatus = analysis?.status || candidate.status;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  currentStatus === 'Shortlisted by Recruiter'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {currentStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.email}</span>
              </span>
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.phone}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{candidate.resume_file} ({candidate.file_type?.toUpperCase() || 'PDF'})</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* AI Match Overview Banner */}
          {analysis && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Match Analysis for: {analysis.job_title}</span>
                </div>
                <p className="text-slate-600 text-xs max-w-xl leading-relaxed">
                  {analysis.decision_support_notes}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 bg-white px-5 py-3 rounded-xl border border-indigo-100 shadow-2xs">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-indigo-600 leading-none">
                    {analysis.match_score}%
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1">
                    Overall Match
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-200" />

                <div className="text-[11px] space-y-0.5 text-slate-500">
                  <div>Skills: <strong>{analysis.matching_skills.length} matched</strong></div>
                  <div>Missing: <strong>{analysis.missing_skills.length} skills</strong></div>
                  <div>Exp: <strong>{candidate.experience} yrs</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 2-Column Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Extracted Skills & Experience */}
            <div className="space-y-5">
              {/* Extracted Skills */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Extracted Skills ({candidate.skills.length})</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => {
                    const isMatching = analysis?.matching_skills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          isMatching
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isMatching && '✓ '}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Experience Details */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Experience Breakdown ({candidate.experience} Years Total)</span>
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                  {candidate.experience_details.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                  {candidate.experience_details.length === 0 && (
                    <li>Standard full-time industry tenure detected.</li>
                  )}
                </ul>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Education Credentials</span>
                </h3>
                <ul className="space-y-1 pl-4 list-disc text-slate-600">
                  {candidate.education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Skill Gap, Projects & Raw Text */}
            <div className="space-y-5">
              {/* Missing Skills Warning */}
              {analysis && analysis.missing_skills.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Missing Job Skills to Review ({analysis.missing_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-red-100/70 text-red-800 border border-red-200"
                      >
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-red-700/80 leading-relaxed">
                    Verify candidate exposure or willingness to upskill in these areas during the technical screen.
                  </p>
                </div>
              )}

              {/* Projects */}
              {candidate.projects && candidate.projects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Key Projects &amp; Implementations
                  </h3>
                  <ul className="space-y-1 pl-4 list-disc text-slate-600">
                    {candidate.projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {candidate.certifications && candidate.certifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Certifications &amp; Training
                  </h3>
                  <ul className="space-y-1 pl-4 list-disc text-slate-600">
                    {candidate.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Raw Parsed Text Inspector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Raw Extracted Resume Stream
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">NLP Text Buffer</span>
                </div>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {candidate.raw_text}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Recruiter Action Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Current Recruiter Decision: <strong className="text-slate-900">{currentStatus}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(candidate.candidate_id, 'Shortlisted by Recruiter')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Shortlist for Interview</span>
            </button>

            <button
              onClick={() => onUpdateStatus(candidate.candidate_id, 'Review')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-lg transition-colors"
            >
              Mark for Review
            </button>

            <button
              onClick={() => onUpdateStatus(candidate.candidate_id, 'Hold')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 font-medium rounded-lg transition-colors"
            >
              Place on Hold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
