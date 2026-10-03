import fs from 'fs';
import path from 'path';
import { Candidate, Job, AnalysisResult, DashboardStats } from '../types.ts';
import { analyzeCandidate } from './resumeMatcher.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface Schema {
  jobs: Job[];
  candidates: Candidate[];
  analysis: AnalysisResult[];
}

function getInitialData(): Schema {
  const job1: Job = {
    job_id: 'job_data_analyst',
    title: 'Data Analyst',
    department: 'Business Intelligence & Analytics',
    description: 'We are seeking a detail-oriented Data Analyst to interpret complex datasets, build automated dashboards in Power BI and Tableau, and write optimized SQL queries. You will collaborate with engineering and product teams to translate raw data into actionable business intelligence.',
    required_skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Tableau'],
    preferred_skills: ['Pandas', 'Data Modeling', 'ETL'],
    experience: 2,
    education: 'Bachelor in Computer Science, Statistics, Mathematics or related quantitative field',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  };

  const job2: Job = {
    job_id: 'job_fullstack_eng',
    title: 'Full-Stack Software Engineer',
    department: 'Product Engineering',
    description: 'Looking for a Full-Stack Engineer skilled in building modern web applications with React, TypeScript, Node.js, and relational databases. Experience with REST APIs and containerized microservices is a plus.',
    required_skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'REST APIs', 'Docker'],
    preferred_skills: ['Tailwind CSS', 'PostgreSQL', 'AWS'],
    experience: 3,
    education: 'B.Tech / B.S. in Computer Science or Software Engineering',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  };

  const job3: Job = {
    job_id: 'job_ml_engineer',
    title: 'Machine Learning Engineer',
    department: 'AI & Data Science Lab',
    description: 'Seeking an ML Engineer to design, evaluate, and deploy NLP and predictive machine learning models. Experience with Python, PyTorch, Scikit-learn, and feature engineering required.',
    required_skills: ['Python', 'PyTorch', 'Scikit-learn', 'NLP', 'TensorFlow', 'SQL'],
    preferred_skills: ['Transformers', 'HuggingFace', 'Docker'],
    experience: 2,
    education: 'M.S. or B.S. in Computer Science, AI, or Data Science',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  };

  const cand1: Candidate = {
    candidate_id: 'cand_vamsi_reddy',
    name: 'Vamsi Dhar Reddy',
    email: 'candidate@example.com',
    phone: '+1 (555) 349-8821',
    skills: ['Python', 'SQL', 'Power BI', 'Excel', 'Java', 'Data Analysis', 'Statistics', 'Pandas'],
    education: ['B.Tech in Computer Science and Engineering', 'JNTU College of Engineering'],
    experience: 2,
    experience_details: [
      'Associate Data Analyst at CloudMetrics Corp (2022 - Present): Built automated BI reporting dashboards and automated SQL extraction workflows',
      'Data Analytics Intern (2021 - 2022): Formulated statistical models and customer segment clustering using Python and Excel'
    ],
    certifications: ['Microsoft Certified: Power BI Data Analyst Associate', 'Python for Data Science Professional Certificate'],
    projects: [
      'Customer Churn Prediction Dashboard using Python, SQL, and Power BI',
      'Automated Financial KPI ETL pipeline and Excel variance reporter',
      'Inventory Optimization Analysis using statistical modeling and Java backend integration'
    ],
    raw_text: `VAMSI DHAR REDDY
Email: candidate@example.com | Phone: +1 (555) 349-8821 | Location: San Jose, CA
LinkedIn: linkedin.com/in/vamsi-dhar-reddy | GitHub: github.com/vamsireddy

PROFESSIONAL SUMMARY:
Results-driven Data Analyst with 2+ years of professional experience leveraging Python, SQL, Power BI, Excel, and Statistics to extract actionable insights from large enterprise datasets. Proven track record in automating ETL queries, developing executive dashboards, and designing statistical reporting models.

TECHNICAL SKILLS:
- Languages: Python, SQL, Java
- Analytics & BI: Power BI, Excel, Advanced Excel, Statistics, Data Analysis, Pandas, NumPy
- Databases: PostgreSQL, MySQL
- Other: Git, JIRA, Agile Methodologies

WORK EXPERIENCE:
Associate Data Analyst | CloudMetrics Corp (July 2022 - Present)
- Engineered automated SQL pipelines across relational databases processing over 500k records daily.
- Designed 12+ interactive Power BI dashboards tracking business KPIs, improving leadership decision speed by 40%.
- Conducted multivariate statistical hypothesis testing and variance regression analysis using Python and Excel.

Data Analytics Intern | InfoScale Solutions (Aug 2021 - June 2022)
- Extracted and cleaned structured operational telemetry data using Python (Pandas) and SQL.
- Formulated automated monthly Excel summary reports with pivot tables, lookups, and visual charts.

EDUCATION:
- B.Tech in Computer Science and Engineering | JNTU College of Engineering (2018 - 2022)

PROJECTS:
- Customer Lifetime Value & Churn Dashboard: Built an end-to-end data pipeline in Python and SQL with interactive Power BI views.
- Financial Metrics Automation: Programmed Python scripts to parse raw CSV exports and generate formatted executive Excel reports.

CERTIFICATIONS:
- Microsoft Certified: Power BI Data Analyst Associate
- Python for Data Science and Machine Learning Bootcamp`,
    resume_file: 'Vamsi_Dhar_Reddy_Resume.pdf',
    file_type: 'pdf',
    uploaded_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: 'Shortlisted by Recruiter'
  };

  const cand2: Candidate = {
    candidate_id: 'cand_sarah_jenkins',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@techview.io',
    phone: '+1 (555) 892-4112',
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'R', 'Data Modeling', 'Data Analysis'],
    education: ['M.S. in Data Science', 'University of Washington'],
    experience: 3.5,
    experience_details: [
      'Senior BI Specialist at Enterprise Insights (2021 - Present): Architected Tableau and Power BI visual dashboards for enterprise clients',
      'Junior Analyst at DataFlow Inc (2019 - 2021): Managed relational data transformations and statistical regressions'
    ],
    certifications: ['Tableau Certified Desktop Specialist', 'Google Data Analytics Certificate'],
    projects: [
      'Omnichannel Sales Tableau Dashboard with dynamic parameter filtering',
      'Predictive customer attrition pipeline in Python and R'
    ],
    raw_text: `SARAH JENKINS
Email: sarah.jenkins@techview.io | Phone: +1 (555) 892-4112
Senior Data & BI Specialist with 3.5 years of experience in Tableau, Power BI, SQL, Python, Excel, and Statistics. Strong expertise in data storytelling and data modeling.`,
    resume_file: 'Sarah_Jenkins_Data_Resume.pdf',
    file_type: 'pdf',
    uploaded_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'Shortlisted by Recruiter'
  };

  const cand3: Candidate = {
    candidate_id: 'cand_alex_chen',
    name: 'Alexander Chen',
    email: 'alex.chen@devmail.org',
    phone: '+1 (555) 773-1994',
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'SQL', 'Docker', 'REST APIs', 'PostgreSQL', 'Git'],
    education: ['B.S. in Software Engineering', 'California State University'],
    experience: 3.0,
    experience_details: [
      'Full-Stack Developer at NextWave Labs (2021 - Present): Built full-stack TypeScript/React portals with Express and Postgres backend',
      'Frontend Developer at CoreApps (2020 - 2021): Implemented responsive web design and component state architecture'
    ],
    certifications: ['Docker Certified Associate', 'AWS Certified Developer Associate'],
    projects: [
      'E-commerce microservice platform with React, TypeScript, and Docker',
      'Real-time collaborative kanban board using WebSockets and Node.js'
    ],
    raw_text: `ALEXANDER CHEN
Email: alex.chen@devmail.org | Phone: +1 (555) 773-1994
Full-Stack Software Engineer with 3 years of hands-on experience building web applications using React, TypeScript, Node.js, Express, Docker, and PostgreSQL.`,
    resume_file: 'Alexander_Chen_Software_Engineer.docx',
    file_type: 'docx',
    uploaded_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'Review'
  };

  const cand4: Candidate = {
    candidate_id: 'cand_priya_sharma',
    name: 'Priya Sharma',
    email: 'priya.sharma@mlresearch.net',
    phone: '+1 (555) 441-2900',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NLP', 'SQL', 'Docker', 'Transformers'],
    education: ['M.S. in Computer Science (Artificial Intelligence)', 'Carnegie Mellon University'],
    experience: 2.5,
    experience_details: [
      'Machine Learning Engineer at SemanticAI (2022 - Present): Researched transformer-based NLP embedding pipelines',
      'AI Research Assistant (2021 - 2022): Fine-tuned LLMs and BERT models for text classification'
    ],
    certifications: ['TensorFlow Developer Certificate', 'DeepLearning.AI NLP Specialization'],
    projects: [
      'Domain-adapted NLP semantic search engine with PyTorch and Sentence Transformers',
      'Document summarization and skill extraction pipeline'
    ],
    raw_text: `PRIYA SHARMA
Email: priya.sharma@mlresearch.net | Phone: +1 (555) 441-2900
Machine Learning Engineer with 2.5 years of experience in NLP, Python, PyTorch, Scikit-learn, TensorFlow, and Transformers. Focused on semantic search and text representation.`,
    resume_file: 'Priya_Sharma_ML_Engineer.pdf',
    file_type: 'pdf',
    uploaded_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'Shortlisted by Recruiter'
  };

  const candidates = [cand1, cand2, cand3, cand4];
  const jobs = [job1, job2, job3];

  const analysis: AnalysisResult[] = [];
  for (const c of candidates) {
    analysis.push(analyzeCandidate(c, job1));
  }

  return { jobs, candidates, analysis };
}

class DBStore {
  private cache: Schema;

  constructor() {
    this.cache = this.load();
  }

  private load(): Schema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data: Schema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.cache = data;
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  getJobs(): Job[] {
    return this.cache.jobs;
  }

  getJob(id: string): Job | undefined {
    return this.cache.jobs.find(j => j.job_id === id);
  }

  addJob(job: Job): Job {
    this.cache.jobs.unshift(job);
    this.save(this.cache);
    return job;
  }

  getCandidates(): Candidate[] {
    return this.cache.candidates;
  }

  getCandidate(id: string): Candidate | undefined {
    return this.cache.candidates.find(c => c.candidate_id === id);
  }

  addCandidate(candidate: Candidate): Candidate {
    this.cache.candidates.unshift(candidate);
    this.save(this.cache);
    return candidate;
  }

  updateCandidateStatus(id: string, status: Candidate['status']): Candidate | null {
    const cand = this.cache.candidates.find(c => c.candidate_id === id);
    if (cand) {
      cand.status = status;
      // Also update any matching analysis results
      for (const a of this.cache.analysis) {
        if (a.candidate_id === id) {
          a.status = status;
        }
      }
      this.save(this.cache);
      return cand;
    }
    return null;
  }

  getAnalysis(jobId?: string): AnalysisResult[] {
    if (jobId) {
      return this.cache.analysis.filter(a => a.job_id === jobId);
    }
    return this.cache.analysis;
  }

  saveAnalysis(result: AnalysisResult): AnalysisResult {
    const idx = this.cache.analysis.findIndex(a => a.candidate_id === result.candidate_id && a.job_id === result.job_id);
    if (idx >= 0) {
      this.cache.analysis[idx] = result;
    } else {
      this.cache.analysis.unshift(result);
    }
    this.save(this.cache);
    return result;
  }

  getStats(targetJobId?: string): DashboardStats {
    const targetResults = targetJobId
      ? this.cache.analysis.filter(a => a.job_id === targetJobId)
      : this.cache.analysis;

    const totalResumes = this.cache.candidates.length;
    const candidatesScreened = targetResults.length;
    const shortlisted = this.cache.candidates.filter(c => c.status === 'Shortlisted by Recruiter').length;

    let avgScore = 0;
    if (targetResults.length > 0) {
      const sum = targetResults.reduce((acc, curr) => acc + curr.match_score, 0);
      avgScore = Math.round(sum / targetResults.length);
    }

    return {
      total_resumes: totalResumes,
      candidates_screened: candidatesScreened,
      average_match_score: avgScore,
      shortlisted_candidates: shortlisted,
      recent_applications: this.cache.candidates.slice(0, 5)
    };
  }

  resetDemoData(): Schema {
    const fresh = getInitialData();
    this.save(fresh);
    return fresh;
  }
}

export const db = new DBStore();
