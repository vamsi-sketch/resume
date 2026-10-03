import React, { useState } from 'react';
import { Briefcase, Sparkles, Check, Plus, ArrowRight } from 'lucide-react';
import { Job } from '../types.ts';

interface JobViewProps {
  jobs: Job[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onCreateJob: (job: Omit<Job, 'job_id' | 'created_at'>) => Promise<void>;
  onNavigateTab: (tab: 'dashboard' | 'job' | 'upload' | 'results' | 'codebase') => void;
}

export const JobView: React.FC<JobViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onCreateJob,
  onNavigateTab
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState('2');
  const [education, setEducation] = useState('Bachelor in Computer Science or related quantitative field');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const samplePresets = [
    {
      title: 'Data Analyst',
      department: 'Business Intelligence & Analytics',
      skills: 'Python, SQL, Excel, Power BI, Statistics, Tableau',
      exp: '2',
      edu: 'Bachelor in Computer Science, Statistics, or Math',
      desc: 'We are seeking a detail-oriented Data Analyst to interpret complex datasets, build automated dashboards in Power BI and Tableau, write optimized SQL queries, and deliver data-driven business insights.',
    },
    {
      title: 'Full-Stack Software Engineer',
      department: 'Platform Engineering',
      skills: 'React, Node.js, TypeScript, SQL, Docker, REST APIs, Git',
      exp: '3',
      edu: 'B.Tech or B.S. in Computer Science or equivalent',
      desc: 'Looking for a skilled Full-Stack Engineer to build scalable web applications using React and Node.js/TypeScript. Candidate should possess solid understanding of microservices, REST APIs, database queries, and CI/CD pipelines.',
    },
    {
      title: 'Machine Learning Engineer',
      department: 'Applied AI Research',
      skills: 'Python, PyTorch, Scikit-learn, NLP, TensorFlow, SQL, Docker',
      exp: '3',
      edu: 'M.S. or B.Tech in Computer Science, AI, or Data Science',
      desc: 'Design and deploy production-grade NLP and computer vision models. Experience with HuggingFace transformers, model quantization, REST APIs, and vector databases required.',
    },
    {
      title: 'Cloud DevOps Engineer',
      department: 'Infrastructure & Cloud',
      skills: 'AWS, Docker, Kubernetes, CI/CD, Terraform, Linux, Python',
      exp: '2.5',
      edu: 'Bachelor Degree in Engineering or IT',
      desc: 'Automate deployment workflows, manage containerized clusters in Kubernetes, ensure high availability on AWS, and maintain infrastructure-as-code scripts using Terraform.',
    },
  ];

  const applyPreset = (preset: typeof samplePresets[0]) => {
    setTitle(preset.title);
    setDepartment(preset.department);
    setSkillsInput(preset.skills);
    setExperience(preset.exp);
    setEducation(preset.edu);
    setDescription(preset.desc);
    setSuccessMsg(`Loaded preset: ${preset.title}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await onCreateJob({
        title: title.trim(),
        department: department.trim() || 'General Engineering',
        required_skills: parsedSkills,
        experience: parseFloat(experience) || 0,
        education: education.trim(),
        description: description.trim(),
      });
      setSuccessMsg('Job successfully created! Existing resumes re-evaluated against new requirements.');
      setTitle('');
      setSkillsInput('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Quick Presets Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Quick 1-Click Role Presets:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {samplePresets.map((p) => (
            <button
              key={p.title}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 transition-all text-xs group"
            >
              <div className="font-bold text-slate-800 group-hover:text-indigo-600">{p.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{p.skills.split(',').slice(0, 3).join(', ')}...</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Job Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900">Define Target Job Description</h2>
            <p className="text-xs text-slate-500">
              The NLP matching engine will extract and compare skills, experience tenure, and domain relevance against these requirements.
            </p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Analyst"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Team</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Business Intelligence"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Required Skills (Comma-Separated) *
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. Python, SQL, Excel, Power BI, Statistics, Tableau"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Skills are normalized via ontology dictionary (e.g. "py" &rarr; "Python", "k8s" &rarr; "Kubernetes").
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum Experience (Years) *</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Requirement</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Bachelor in quantitative field"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Job Description *</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste complete role responsibilities, deliverables, and technical qualifications..."
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Screening Resumes...' : 'Save Job Description & Run Screen'}</span>
            </button>
          </form>
        </div>

        {/* Existing Active Jobs List (1 Col) */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Active Job Openings ({jobs.length})</h3>
            <div className="space-y-3">
              {jobs.map((j) => {
                const isSelected = j.job_id === selectedJobId;
                return (
                  <div
                    key={j.job_id}
                    onClick={() => onSelectJob(j.job_id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs text-slate-900">{j.title}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600">
                        {j.experience}+ yrs
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{j.department}</div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {j.required_skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white text-slate-700 border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                      {j.required_skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{j.required_skills.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                      <span className="text-indigo-600 font-medium">{isSelected ? '● Active' : 'Click to select'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectJob(j.job_id);
                          onNavigateTab('results');
                        }}
                        className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-0.5"
                      >
                        <span>Rankings</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
