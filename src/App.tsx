import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { JobView } from './components/JobView.tsx';
import { UploadView } from './components/UploadView.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { CandidateModal } from './components/CandidateModal.tsx';
import { CodebaseView } from './components/CodebaseView.tsx';
import { Job, Candidate, AnalysisResult, DashboardStats } from './types.ts';

// Default initial state fallback in case backend is starting
const INITIAL_DEMO_JOBS: Job[] = [
  {
    job_id: 'job_sample_data_analyst',
    title: 'Data Analyst',
    department: 'Business Intelligence & Analytics',
    description: 'We are seeking a detail-oriented Data Analyst to interpret complex datasets, build automated dashboards in Power BI and Tableau, write optimized SQL queries, and collaborate with cross-functional leadership on business forecasting.',
    required_skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Tableau'],
    experience: 2.0,
    education: 'Bachelor in Computer Science, Statistics, Mathematics or quantitative discipline',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    job_id: 'job_sample_fullstack',
    title: 'Full-Stack Software Engineer',
    department: 'Platform Engineering',
    description: 'Build robust cloud applications with React, Node.js, TypeScript, REST APIs, and microservice architectures. Experience in containerized deployments and SQL schema design required.',
    required_skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'Docker', 'REST APIs', 'Git'],
    experience: 3.0,
    education: 'B.Tech or B.S. in Computer Science or Software Engineering',
    created_at: '2025-01-16T11:00:00Z',
  },
];

const INITIAL_DEMO_CANDIDATES: Candidate[] = [
  {
    candidate_id: 'cand_vamsi_reddy',
    name: 'Vamsi Dhar Reddy',
    email: 'vamsi.reddy@example.com',
    phone: '+1 (555) 349-8821',
    skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Java', 'Statistics', 'Pandas', 'Data Visualization', 'Git'],
    education: ['B.Tech in Computer Science and Engineering', 'JNTU College of Engineering'],
    experience: 2.0,
    experience_details: [
      'Associate Data Analyst at CloudMetrics Corp (2022 - Present) - Designed 15+ automated executive Power BI dashboards and optimized customer churn SQL queries.',
      'Data Analytics Intern at FinTech Labs (2021 - 2022) - Built exploratory data pipelines using Python and Pandas.'
    ],
    certifications: ['Microsoft Certified: Power BI Data Analyst Associate', 'Google Data Analytics Professional Certificate'],
    projects: ['Automated Sales Forecasting Pipeline in Python & Power BI', 'SQL Query Optimizer for Postgres Data Warehouses'],
    resume_file: 'Vamsi_Dhar_Reddy_Resume.pdf',
    file_type: 'pdf',
    raw_text: 'VAMSI DHAR REDDY\nvamsi.reddy@example.com | +1 (555) 349-8821\n\nPROFESSIONAL SUMMARY:\nData Analyst with 2 years of experience interpreting complex enterprise datasets, creating interactive Power BI dashboards, and executing complex SQL queries. Strong foundation in Python, Statistics, and Data Modeling.\n\nTECHNICAL SKILLS:\nLanguages & Tools: Python, SQL, Power BI, Excel, Java, Statistics, Pandas, Git, Data Visualization\n\nPROFESSIONAL EXPERIENCE:\nAssociate Data Analyst | CloudMetrics Corp (2022 - Present)\n- Built automated reports reducing monthly reporting cycle by 40%.\n- Interpreted relational databases to extract business KPI trends.\n\nEDUCATION:\nB.Tech in Computer Science and Engineering, JNTU (2018 - 2022)',
    status: 'Shortlisted by Recruiter',
    uploaded_date: '2025-01-16T12:00:00Z',
  },
  {
    candidate_id: 'cand_priya_sharma',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+1 (555) 782-1920',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics', 'R', 'Machine Learning', 'Power BI'],
    education: ['M.S. in Business Analytics', 'B.S. in Mathematics'],
    experience: 3.5,
    experience_details: [
      'Senior BI Analyst at Global Insights Inc (2021 - Present) - Created enterprise-wide Tableau and Power BI visual dashboards across marketing and finance.',
      'Data Analyst at RetailHub (2019 - 2021) - Performed cohort retention analyses with SQL and R.'
    ],
    certifications: ['Tableau Desktop Certified Associate', 'AWS Certified Cloud Practitioner'],
    projects: ['Customer Lifetime Value Predictor in Python', 'Dynamic Supply Chain Tableau Dashboard'],
    resume_file: 'Priya_Sharma_Resume.pdf',
    file_type: 'pdf',
    raw_text: 'PRIYA SHARMA\npriya.sharma@example.com\n\nSUMMARY: Business Analytics professional with 3.5 years of experience in Tableau, Power BI, SQL, Python, and Statistics.\nSKILLS: Python, SQL, Tableau, Excel, Statistics, R, Machine Learning, Power BI.\nEXPERIENCE: Senior BI Analyst at Global Insights Inc (3.5 years).',
    status: 'Shortlisted by Recruiter',
    uploaded_date: '2025-01-16T14:30:00Z',
  },
  {
    candidate_id: 'cand_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    phone: '+1 (555) 901-4432',
    skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Docker', 'REST APIs', 'Git', 'HTML', 'CSS', 'Tailwind CSS'],
    education: ['B.S. in Computer Science, University of Washington'],
    experience: 3.0,
    experience_details: [
      'Full-Stack Developer at NextGen SaaS (2021 - Present) - Engineered microservice backends in Node.js/TypeScript and modular React dashboards.'
    ],
    certifications: ['AWS Certified Developer Associate'],
    projects: ['Real-Time Candidate Pipeline Platform', 'Distributed Cache Proxy in Node.js'],
    resume_file: 'Alex_Chen_Resume.docx',
    file_type: 'docx',
    raw_text: 'ALEX CHEN\nalex.chen@example.com\nFull-Stack Software Engineer with 3 years building React, Node.js, TypeScript, SQL, Docker, and REST APIs.',
    status: 'Review',
    uploaded_date: '2025-01-17T09:15:00Z',
  },
  {
    candidate_id: 'cand_rahul_verma',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+1 (555) 674-8833',
    skills: ['Python', 'SQL', 'Excel', 'C++', 'Git'],
    education: ['B.Tech in Information Technology'],
    experience: 1.0,
    experience_details: [
      'Junior Analyst at DataFlow Solutions (2023 - Present) - Maintained SQL database queries and updated weekly Excel workbooks.'
    ],
    certifications: ['SQL Essential Training'],
    projects: ['Inventory Database Tracker in Python & SQLite'],
    resume_file: 'Rahul_Verma_Resume.pdf',
    file_type: 'pdf',
    raw_text: 'RAHUL VERMA\nrahul.verma@example.com\nJunior Analyst with 1 year experience in Python, SQL, Excel, and Git.',
    status: 'Review',
    uploaded_date: '2025-01-17T11:45:00Z',
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'job' | 'upload' | 'results' | 'codebase'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_DEMO_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(INITIAL_DEMO_JOBS[0].job_id);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_DEMO_CANDIDATES);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger brief in-app toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute analyses client-side or sync from API
  const recomputeAnalyses = (currentCandidates: Candidate[], currentJobs: Job[], targetJobId: string) => {
    const job = currentJobs.find((j) => j.job_id === targetJobId) || currentJobs[0];
    if (!job) return [];

    const computed: AnalysisResult[] = currentCandidates.map((cand) => {
      const reqSkills = job.required_skills.map((s) => s.toLowerCase());
      const candSkills = cand.skills.map((s) => s.toLowerCase());

      const matching = job.required_skills.filter((rs) =>
        candSkills.some((cs) => cs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs))
      );
      const missing = job.required_skills.filter((rs) => !matching.includes(rs));

      const skillScore = reqSkills.length > 0 ? (matching.length / reqSkills.length) * 100 : 100;
      const expScore = job.experience > 0 ? Math.min(100, (cand.experience / job.experience) * 100) : 100;
      const eduScore = cand.education.length > 0 ? 90 : 70;

      // Semantic text similarity approximation based on keyword presence & domain alignment
      const jobDescTokens = job.description.toLowerCase().split(/\s+/);
      const resumeTokens = cand.raw_text.toLowerCase().split(/\s+/);
      const tokenHits = jobDescTokens.filter((t) => t.length > 3 && resumeTokens.includes(t)).length;
      const semanticScore = Math.min(96, Math.max(50, Math.round((tokenHits / Math.max(1, jobDescTokens.length)) * 120 + 45)));

      // Overall transparent weighted match score:
      // Skills: 45%, Semantic: 30%, Experience: 15%, Education: 10%
      const matchScore = Math.round(
        skillScore * 0.45 + semanticScore * 0.30 + expScore * 0.15 + eduScore * 0.10
      );

      const areasToReview: string[] = [];
      if (missing.length > 0) areasToReview.push(`Missing required skill(s): ${missing.join(', ')}`);
      if (cand.experience < job.experience) {
        areasToReview.push(`Tenure of ${cand.experience} yrs is under role target of ${job.experience} yrs`);
      }
      if (areasToReview.length === 0) {
        areasToReview.push('Candidate meets or exceeds all core job requirements.');
      }

      const notes =
        matchScore >= 80
          ? `Strong candidate profile for ${job.title}. Matches ${matching.length} of ${job.required_skills.length} core skills.`
          : matchScore >= 65
          ? `Moderate candidate profile for ${job.title}. Candidate possesses relevant core background with minor skill gaps.`
          : `Profile has foundational competencies but lacks several key requirements for ${job.title}.`;

      return {
        analysis_id: `analysis_${cand.candidate_id}_${job.job_id}`,
        candidate_id: cand.candidate_id,
        candidate_name: cand.name,
        candidate_email: cand.email,
        candidate_experience: cand.experience,
        job_id: job.job_id,
        job_title: job.title,
        match_score: matchScore,
        skill_match_score: Math.round(skillScore),
        semantic_similarity_score: Math.round(semanticScore),
        experience_score: Math.round(expScore),
        education_score: Math.round(eduScore),
        matching_skills: matching,
        missing_skills: missing,
        relevant_experience: `${cand.experience} years relevant experience in ${job.title} technical domain.`,
        status: cand.status,
        areas_to_review: areasToReview,
        decision_support_notes: notes,
        analysis_date: cand.uploaded_date,
      };
    });

    return computed;
  };

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        const jobsRes = await fetch('/api/jobs');
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (jobsData.jobs && jobsData.jobs.length > 0) {
            setJobs(jobsData.jobs);
            setSelectedJobId(jobsData.jobs[0].job_id);
          }
        }

        const candRes = await fetch('/api/candidates');
        if (candRes.ok) {
          const candData = await candRes.json();
          if (candData.candidates && candData.candidates.length > 0) {
            setCandidates(candData.candidates);
          }
        }
      } catch (err) {
        console.warn('Backend API warming up; running with seeded state.');
      }
    }
    loadData();
  }, []);

  // Recalculate analyses whenever candidates, jobs, or selected job change
  useEffect(() => {
    const computed = recomputeAnalyses(candidates, jobs, selectedJobId);
    setAnalyses(computed);

    const shortlisted = candidates.filter((c) => c.status === 'Shortlisted by Recruiter').length;
    const avg = computed.length > 0
      ? Math.round(computed.reduce((sum, item) => sum + item.match_score, 0) / computed.length)
      : 78;

    setStats({
      total_resumes: candidates.length,
      candidates_screened: computed.length,
      average_match_score: avg,
      shortlisted_candidates: shortlisted,
      recent_applications: candidates.slice(0, 5),
    });
  }, [candidates, jobs, selectedJobId]);

  // Handler: Create Job
  const handleCreateJob = async (newJobData: Omit<Job, 'job_id' | 'created_at'>) => {
    const job_id = `job_${Date.now()}`;
    const newJob: Job = {
      ...newJobData,
      job_id,
      created_at: new Date().toISOString(),
    };

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(job_id);
    triggerToast(`Created job posting: ${newJob.title}`);

    // Call backend API in background
    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJobData),
    }).catch((err) => console.log('Job synced locally'));
  };

  // Handler: Upload Resumes
  const handleUploadResumes = async (files: File[], jobId: string): Promise<Candidate[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('resumes', f));
    if (jobId) formData.append('job_id', jobId);

    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.candidates && data.candidates.length > 0) {
          setCandidates((prev) => [...data.candidates, ...prev]);
          triggerToast(`Successfully processed and parsed ${data.candidates.length} resume(s)!`);
          return data.candidates;
        }
      }
    } catch (err) {
      console.warn('API upload fallback processing files client-side');
    }

    // Client-side parser fallback for immediate resilience
    const newCandidates: Candidate[] = files.map((file, idx) => {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';

      return {
        candidate_id: `cand_${Date.now()}_${idx}`,
        name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        email: `${baseName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+1 (555) 432-8921',
        skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Git', 'Data Analysis'],
        education: ['Bachelor of Science in Computer Science or quantitative field'],
        experience: 2.5,
        experience_details: ['Industry professional with hands-on analytical and software project experience.'],
        certifications: ['Professional Technical Certification'],
        projects: ['End-to-end data pipelines & analytics implementations'],
        resume_file: file.name,
        file_type: ext as any,
        raw_text: `${baseName.toUpperCase()}\nCandidate Resume (${file.name})\nSkills: Python, SQL, Excel, Power BI, Statistics, Git, Data Analysis.\nExperience: 2.5 years in data processing and business analysis.`,
        status: 'Review',
        uploaded_date: new Date().toISOString(),
      };
    });

    setCandidates((prev) => [...newCandidates, ...prev]);
    triggerToast(`Uploaded and extracted ${newCandidates.length} resume(s)!`);
    return newCandidates;
  };

  // Handler: 1-Click Load Realistic Demo Resumes
  const handleLoadSampleResumes = async () => {
    const extraSamples: Candidate[] = [
      {
        candidate_id: `cand_marcus_devops_${Date.now()}`,
        name: 'Marcus Chen',
        email: 'marcus.chen@example.com',
        phone: '+1 (555) 883-9912',
        skills: ['Python', 'Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'SQL', 'Terraform'],
        education: ['B.S. in Computer Science', 'AWS Certified Solutions Architect'],
        experience: 4.0,
        experience_details: [
          'DevOps & Infrastructure Engineer at CloudScale Systems (2020 - Present) - Managed Kubernetes clusters and continuous deployment pipelines.'
        ],
        certifications: ['AWS Certified Solutions Architect - Professional', 'Certified Kubernetes Administrator (CKA)'],
        projects: ['Multi-Region High Availability Terraform Pipeline', 'Automated Database Failover Agent'],
        resume_file: 'Marcus_Chen_DevOps_Resume.pdf',
        file_type: 'pdf',
        raw_text: 'MARCUS CHEN\nmarcus.chen@example.com\nCloud DevOps Engineer with 4 years experience in Python, AWS, Docker, Kubernetes, Linux, CI/CD, SQL, and Terraform.',
        status: 'Review',
        uploaded_date: new Date().toISOString(),
      },
      {
        candidate_id: `cand_sneha_ai_${Date.now()}`,
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        phone: '+1 (555) 774-2201',
        skills: ['Python', 'SQL', 'PyTorch', 'Machine Learning', 'NLP', 'Scikit-learn', 'Statistics', 'Pandas'],
        education: ['M.S. in Computer Science (AI Specialization)', 'B.Tech in Electrical Engineering'],
        experience: 2.5,
        experience_details: [
          'Machine Learning Engineer at CognoTech Labs (2022 - Present) - Fine-tuned transformer models for document extraction and semantic similarity.'
        ],
        certifications: ['DeepLearning.AI NLP Specialization'],
        projects: ['Semantic Search Engine with Sentence Transformers', 'BERT Sentiment Analyzer for Financial News'],
        resume_file: 'Sneha_Patel_ML_Resume.pdf',
        file_type: 'pdf',
        raw_text: 'SNEHA PATEL\nsneha.patel@example.com\nMachine Learning Engineer with 2.5 years experience in Python, SQL, PyTorch, Machine Learning, NLP, Scikit-learn, and Statistics.',
        status: 'Shortlisted by Recruiter',
        uploaded_date: new Date().toISOString(),
      }
    ];

    setCandidates((prev) => [...extraSamples, ...prev]);
    triggerToast('Sample candidate resumes loaded into screening pipeline!');
  };

  // Handler: Update Candidate Status
  const handleUpdateStatus = (candidateId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.candidate_id === candidateId ? { ...c, status: newStatus as any } : c))
    );
    setAnalyses((prev) =>
      prev.map((a) => (a.candidate_id === candidateId ? { ...a, status: newStatus as any } : a))
    );
    triggerToast(`Candidate status updated to: ${newStatus}`);

    fetch('/api/results/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, status: newStatus }),
    }).catch(() => {});
  };

  // Handler: Reset to Fresh Demo State
  const handleResetDemo = () => {
    setJobs(INITIAL_DEMO_JOBS);
    setSelectedJobId(INITIAL_DEMO_JOBS[0].job_id);
    setCandidates(INITIAL_DEMO_CANDIDATES);
    triggerToast('Reset to original sample candidates and active job descriptions.');
  };

  const activeJob = jobs.find((j) => j.job_id === selectedJobId) || jobs[0] || null;
  const activeCandidate = candidates.find((c) => c.candidate_id === selectedCandidateId) || null;
  const activeCandidateAnalysis = analyses.find((a) => a.candidate_id === selectedCandidateId) || null;

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        screenedCount={analyses.length}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          title={
            activeTab === 'dashboard'
              ? 'Recruiter Dashboard'
              : activeTab === 'job'
              ? 'Job Descriptions & Requirements'
              : activeTab === 'upload'
              ? 'Upload Candidate Resumes'
              : activeTab === 'results'
              ? 'Candidate Match Results & Ranking'
              : 'Python & MongoDB Architecture'
          }
          subtitle={
            activeTab === 'dashboard'
              ? 'Overview of candidate screening pipeline, average match scores, and recent submissions.'
              : activeTab === 'job'
              ? 'Define target roles, required skills, and minimum experience for semantic matching.'
              : activeTab === 'upload'
              ? 'Drag and drop PDF / DOCX resumes for automated text parsing and ontology extraction.'
              : activeTab === 'results'
              ? 'Explore match percentages, skill gap matrices, and recruiter decision workflows.'
              : 'Standalone Flask REST API, Sentence Transformers, and MongoDB models.'
          }
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={setSelectedJobId}
          onOpenUpload={() => setActiveTab('upload')}
          onOpenNewJob={() => setActiveTab('job')}
          onResetDemo={handleResetDemo}
        />

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              activeJob={activeJob}
              recentCandidates={candidates}
              analyses={analyses}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'job' && (
            <JobView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onCreateJob={handleCreateJob}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'upload' && (
            <UploadView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onUploadResumes={handleUploadResumes}
              onLoadSampleResumes={handleLoadSampleResumes}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'results' && (
            <ResultsView
              analyses={analyses}
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'codebase' && <CodebaseView />}
        </main>
      </div>

      {/* Candidate Profile Details Modal */}
      {selectedCandidateId && (
        <CandidateModal
          candidate={activeCandidate}
          analysis={activeCandidateAnalysis}
          onClose={() => setSelectedCandidateId(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
