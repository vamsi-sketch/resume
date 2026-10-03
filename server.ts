import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './src/services/dbStore.ts';
import { extractTextFromFileBuffer } from './src/services/fileExtractor.ts';
import { parseResumeText } from './src/services/resumeParser.ts';
import { analyzeCandidate } from './src/services/resumeMatcher.ts';
import { Job, Candidate } from './src/types.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === 'application/pdf' || file.mimetype.includes('wordprocessingml')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed.'));
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 2. Jobs API
  // POST /api/jobs: Create a new job description
  app.post('/api/jobs', (req, res) => {
    try {
      const { title, description, required_skills, experience, department, education, preferred_skills } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Job title and description are required.' });
      }

      let parsedSkills: string[] = [];
      if (Array.isArray(required_skills)) {
        parsedSkills = required_skills.map((s: string) => s.trim()).filter(Boolean);
      } else if (typeof required_skills === 'string') {
        parsedSkills = required_skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      if (parsedSkills.length === 0) {
        return res.status(400).json({ error: 'At least one required skill must be specified.' });
      }

      const newJob: Job = {
        job_id: 'job_' + Math.random().toString(36).substring(2, 9),
        title: title.trim(),
        department: department?.trim() || 'General',
        description: description.trim(),
        required_skills: parsedSkills,
        preferred_skills: Array.isArray(preferred_skills) ? preferred_skills : [],
        experience: Number(experience) || 0,
        education: education?.trim() || 'Bachelor Degree or equivalent experience',
        created_at: new Date().toISOString()
      };

      db.addJob(newJob);

      // Automatically screen existing candidates against this new job
      const candidates = db.getCandidates();
      for (const cand of candidates) {
        const analysis = analyzeCandidate(cand, newJob);
        db.saveAnalysis(analysis);
      }

      return res.status(201).json({ success: true, message: 'Job created successfully', job: newJob });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create job';
      return res.status(500).json({ error: msg });
    }
  });

  // GET /api/jobs: Get all jobs
  app.get('/api/jobs', (_req, res) => {
    try {
      const jobs = db.getJobs();
      res.json({ success: true, count: jobs.length, jobs });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve jobs';
      res.status(500).json({ error: msg });
    }
  });

  // 3. Resume Upload API
  // POST /api/resumes/upload: Upload one or more resumes (PDF / DOCX)
  app.post('/api/resumes/upload', upload.array('resumes', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Please upload at least one PDF or DOCX resume file.' });
      }

      const jobId = (req.body.job_id as string) || db.getJobs()[0]?.job_id;
      const targetJob = jobId ? db.getJob(jobId) : db.getJobs()[0];

      const uploadedCandidates: Candidate[] = [];
      const errors: string[] = [];

      for (const file of files) {
        try {
          const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
          const fileType = ext === 'docx' ? 'docx' : ext === 'pdf' ? 'pdf' : 'text';

          const text = await extractTextFromFileBuffer(file.buffer, file.originalname);
          if (!text || text.trim().length < 20) {
            errors.push(`${file.originalname}: Extracted text was empty or unreadable.`);
            continue;
          }

          const candidate = parseResumeText(text, file.originalname, fileType);
          db.addCandidate(candidate);
          uploadedCandidates.push(candidate);

          // If a target job exists, automatically analyze and store
          if (targetJob) {
            const analysis = analyzeCandidate(candidate, targetJob);
            db.saveAnalysis(analysis);
          }
        } catch (fileErr: unknown) {
          const errText = fileErr instanceof Error ? fileErr.message : 'Parsing error';
          errors.push(`${file.originalname}: ${errText}`);
        }
      }

      res.status(201).json({
        success: uploadedCandidates.length > 0,
        message: `Successfully processed ${uploadedCandidates.length} resume(s).`,
        candidates: uploadedCandidates,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload resumes';
      res.status(500).json({ error: msg });
    }
  });

  // 4. Candidates API
  // GET /api/candidates: List all candidates
  app.get('/api/candidates', (_req, res) => {
    try {
      const candidates = db.getCandidates();
      res.json({ success: true, count: candidates.length, candidates });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch candidates';
      res.status(500).json({ error: msg });
    }
  });

  // GET /api/candidates/:id: Get candidate by ID with analysis history
  app.get('/api/candidates/:id', (req, res) => {
    try {
      const candidate = db.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      const analyses = db.getAnalysis().filter(a => a.candidate_id === candidate.candidate_id);
      res.json({ success: true, candidate, analyses });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch candidate details';
      res.status(500).json({ error: msg });
    }
  });

  // 5. Analysis API
  // POST /api/analyze/:candidate_id: Run AI matching against a specified job
  app.post('/api/analyze/:candidate_id', (req, res) => {
    try {
      const candidate = db.getCandidate(req.params.candidate_id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const jobId = (req.body.job_id as string) || db.getJobs()[0]?.job_id;
      const job = db.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Target job description not found' });
      }

      const analysis = analyzeCandidate(candidate, job);
      db.saveAnalysis(analysis);

      res.json({ success: true, analysis });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      res.status(500).json({ error: msg });
    }
  });

  // GET /api/results: Candidate results and ranking
  app.get('/api/results', (req, res) => {
    try {
      const { job_id, search, min_score, skill, status, sort } = req.query;

      let results = db.getAnalysis(job_id ? String(job_id) : undefined);

      // Search filter (candidate name or email)
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        results = results.filter(r =>
          r.candidate_name.toLowerCase().includes(query) ||
          r.candidate_email.toLowerCase().includes(query)
        );
      }

      // Skill filter
      if (skill && typeof skill === 'string' && skill.trim()) {
        const targetSkill = skill.toLowerCase().trim();
        results = results.filter(r =>
          r.matching_skills.some(s => s.toLowerCase().includes(targetSkill))
        );
      }

      // Min Score filter
      if (min_score) {
        const minVal = Number(min_score);
        if (!isNaN(minVal)) {
          results = results.filter(r => r.match_score >= minVal);
        }
      }

      // Status filter
      if (status && typeof status === 'string' && status !== 'all') {
        results = results.filter(r => r.status === status);
      }

      // Sorting
      if (sort === 'experience') {
        results.sort((a, b) => b.candidate_experience - a.candidate_experience);
      } else if (sort === 'date') {
        results.sort((a, b) => new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime());
      } else if (sort === 'name') {
        results.sort((a, b) => a.candidate_name.localeCompare(b.candidate_name));
      } else {
        // Default sort: match score descending
        results.sort((a, b) => b.match_score - a.match_score);
      }

      res.json({ success: true, count: results.length, results });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve results';
      res.status(500).json({ error: msg });
    }
  });

  // POST /api/results/status: Update candidate status (Shortlisted, Review, Hold)
  app.post('/api/results/status', (req, res) => {
    try {
      const { candidate_id, status } = req.body;
      if (!candidate_id || !status) {
        return res.status(400).json({ error: 'Candidate ID and new status are required' });
      }

      const validStatuses = ['Review', 'Shortlisted by Recruiter', 'Under Review', 'Hold'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status label' });
      }

      const updated = db.updateCandidateStatus(candidate_id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      res.json({ success: true, message: 'Status updated successfully', candidate: updated });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      res.status(500).json({ error: msg });
    }
  });

  // GET /api/stats: Recruiter dashboard high-level metrics
  app.get('/api/stats', (req, res) => {
    try {
      const jobId = req.query.job_id as string | undefined;
      const stats = db.getStats(jobId);
      res.json({ success: true, stats });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve dashboard stats';
      res.status(500).json({ error: msg });
    }
  });

  // POST /api/reset-demo: Reset database to clean showcase dataset
  app.post('/api/reset-demo', (_req, res) => {
    try {
      const fresh = db.resetDemoData();
      res.json({ success: true, message: 'Demo data restored successfully', stats: db.getStats() });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      res.status(500).json({ error: msg });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
