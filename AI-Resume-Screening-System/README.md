# AI-Based Resume Screening and Candidate Matching System

An automated, recruiter-centric decision support platform designed to streamline candidate screening. The system extracts candidate profiles from PDF/DOCX resumes, matches them semantically with target Job Descriptions using NLP embeddings and skill ontology extraction, computes transparent match percentages, highlights missing qualifications, and ranks candidates on an intuitive recruitment dashboard.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Python Environment Setup](#installation--python-environment-setup)
6. [MongoDB Configuration](#mongodb-configuration)
7. [Environment Variables (.env)](#environment-variables-env)
8. [Running the Backend & Frontend](#running-the-backend--frontend)
9. [REST API Documentation](#rest-api-documentation)
10. [Sample Job Description & Resume Workflow](#sample-job-description--resume-workflow)
11. [AI & NLP Scoring Methodology](#ai--nlp-scoring-methodology)
12. [College Demo & Viva Q&A Guide](#college-demo--viva-qa-guide)
13. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview

Manual resume review is time-consuming and prone to unconscious bias or oversight. The **AI-Based Resume Screening and Candidate Matching System** solves this challenge by acting as an objective **decision-support tool** for human recruiters:

- **Automated Text Extraction:** Parses structured and unstructured text from `.pdf` and `.docx` documents.
- **Ontology-Driven Skill Extraction:** Recognizes 150+ technical and professional skills and their synonyms (e.g., `JS` &rarr; `JavaScript`, `K8s` &rarr; `Kubernetes`).
- **NLP Semantic Matching:** Evaluates overall resume contextual similarity against the Job Description using dense sentence embeddings (`all-MiniLM-L6-v2`) and TF-IDF cosine similarity.
- **Transparent Mathematical Scoring:** Generates a verifiable match score (0–100%) based on skills, domain semantics, experience tenure, and education credentials.
- **Ethical Decision Support:** Never automatically rejects candidates; presents transparent pros, cons, and missing skill areas for final human decision-making.

---

## 2. Key Features

- **Recruiter Dashboard:** Real-time KPI cards (Total Resumes, Candidates Screened, Average Match Score, Shortlisted Candidates), and recent application tables.
- **Job Description Management:** Define job title, department, required skills (comma-separated), minimum experience, and detailed responsibilities.
- **Multi-File Resume Upload:** Upload single or batch PDF/DOCX resumes with format and size validation.
- **Information Extraction Pipeline:**
  - Candidate Name, Email address, and Phone number
  - Technical & Soft Skills
  - Education credentials (B.Tech, B.S., M.S., MBA, Ph.D., etc.)
  - Total years of experience & timeline details
  - Academic & industrial projects and certifications
- **Skill Gap & Match Matrix:**
  - Matching Skills found (`✓ Python`, `✓ SQL`, `✓ Power BI`, `✓ Excel`)
  - Missing Skills identified (`✗ Tableau`)
- **Interactive Results & Ranking:** Search by candidate name/email, filter by skill, filter by minimum match score, sort by score or experience, and update candidate statuses (`Shortlisted by Recruiter`, `Review`, `Under Review`, `Hold`).
- **Comprehensive Candidate Profile:** Detailed view with raw extracted resume text, credential breakdown, and specific recruiter review recommendations.

---

## 3. Technology Stack

### Frontend
- **HTML5 & CSS3:** Semantic markup, responsive mobile-to-desktop layout, CSS variables, and modern cards.
- **Vanilla JavaScript:** Clean fetch API integration, DOM updates, drag-and-drop file processing, and instant filtering.

### Backend
- **Python 3.9+ / 3.10+:** Robust server-side runtime.
- **Flask & Flask-CORS:** Lightweight, modular REST API framework.

### AI / NLP
- **Sentence Transformers (`all-MiniLM-L6-v2`):** Pretrained dense semantic vector embeddings.
- **Scikit-learn:** TF-IDF n-gram vectorization and cosine similarity calculations.
- **Custom Skill Ontology (`skill_database.json`):** 150+ technical skills and synonym mapping dictionary.

### Document Processing
- **pdfplumber & PyPDF2:** High-fidelity text extraction from PDF documents.
- **python-docx:** Extraction of paragraphs, lists, and tables from `.docx` files.

### Database
- **MongoDB:** Flexible document storage for `candidates`, `jobs`, and `analysis` collections (with built-in local fallback mode for instant demonstration).

---

## 4. Folder Structure

```
AI-Resume-Screening-System/
│
├── frontend/
│   ├── index.html          # Landing / Portal entry page
│   ├── dashboard.html      # Recruiter analytics dashboard
│   ├── job.html            # Job description creator & active jobs
│   ├── upload.html         # Drag-and-drop resume upload zone
│   ├── results.html        # Candidate match rankings & filters
│   ├── candidate.html      # Candidate profile & raw resume text
│   │
│   ├── css/
│   │   ├── style.css       # Global layout & CSS variables
│   │   ├── dashboard.css   # Metrics & table styling
│   │   └── results.css     # Filter controls & candidate cards
│   │
│   └── js/
│       ├── main.js         # Navigation & global toast notifications
│       ├── dashboard.js    # Metric card loaders & recent tables
│       ├── upload.js       # File queue & upload dispatch
│       └── results.js      # Sorting, filtering & status updating
│
├── backend/
│   ├── app.py              # Main Flask server entry point
│   ├── config.py           # Configuration loader
│   │
│   ├── routes/
│   │   ├── resume_routes.py # /api/resumes/upload, /api/candidates
│   │   ├── job_routes.py    # /api/jobs
│   │   └── result_routes.py # /api/results, /api/analyze, /api/stats
│   │
│   ├── services/
│   │   ├── resume_parser.py # Contact, education & exp regex parser
│   │   ├── skill_extractor.py # Skill identification & matching
│   │   ├── resume_matcher.py # Multi-criteria match orchestration
│   │   └── scoring.py       # Transparent weighted score engine
│   │
│   ├── models/
│   │   ├── candidate.py     # MongoDB Candidate schema
│   │   └── job.py           # MongoDB Job schema
│   │
│   └── utils/
│       ├── pdf_reader.py    # PDF and DOCX file text reader
│       └── text_cleaner.py  # Whitespace & character normalizer
│
├── ai/
│   ├── nlp_model.py         # NLP Model service wrapper
│   ├── embeddings.py        # SentenceTransformer & TF-IDF vectors
│   └── skill_database.json  # Comprehensive skill & synonym database
│
├── uploads/                 # Temporary storage for uploaded resumes
├── database/
│   └── database.py          # PyMongo connection with demo fallback
│
├── requirements.txt         # Python package dependencies
├── .env                     # Environment variables configuration
├── .gitignore               # Git ignored patterns
└── README.md                # Full project documentation
```

---

## 5. Installation & Python Environment Setup

### Prerequisites
- Python 3.9, 3.10, or 3.11 installed
- pip (Python package manager)
- MongoDB installed locally or a free MongoDB Atlas connection string (optional; a resilient local fallback is included)

### Step 1: Clone or Navigate to the Project Directory
```bash
cd AI-Resume-Screening-System
```

### Step 2: Create a Virtual Environment
On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows:
```cmd
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

---

## 6. MongoDB Configuration

### Option A: Local MongoDB
Ensure the MongoDB daemon is active:
```bash
mongod --dbpath /data/db
```
Default URI: `mongodb://localhost:27017/resume_screening_db`

### Option B: MongoDB Atlas (Cloud)
In your `.env` file, replace `MONGO_URI` with your connection URI:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/resume_screening_db?retryWrites=true&w=majority
```

### Option C: Automatic Fallback Mode
If MongoDB is not installed on the system, the application will automatically detect this and run in **Local Demo Persistence Mode** without crashing, saving records to `database/local_demo_store.json`.

---

## 7. Environment Variables (.env)

Edit the `.env` file in the project root:

```env
PORT=5000
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=recruiter_ai_secret_key_2025

MONGO_URI=mongodb://localhost:27017/resume_screening_db
DATABASE_NAME=resume_screening_db

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=pdf,docx

NLP_MODEL_NAME=all-MiniLM-L6-v2
SIMILARITY_THRESHOLD=0.65
```

---

## 8. Running the Backend & Frontend

Start the server:
```bash
python backend/app.py
```

The Flask server will launch and serve both the REST API and the static frontend pages:
- **Recruiter Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **Job Creation:** [http://localhost:5000/job.html](http://localhost:5000/job.html)
- **Resume Upload:** [http://localhost:5000/upload.html](http://localhost:5000/upload.html)
- **Candidate Results:** [http://localhost:5000/results.html](http://localhost:5000/results.html)

---

## 9. REST API Documentation

### 1. Job Management

- **Create Job:** `POST /api/jobs`
  - *Request Body:*
    ```json
    {
      "title": "Data Analyst",
      "department": "Business Intelligence",
      "description": "Interpret datasets, write SQL, build Power BI reports...",
      "required_skills": ["Python", "SQL", "Excel", "Power BI", "Statistics", "Tableau"],
      "experience": 2.0,
      "education": "Bachelor in quantitative field"
    }
    ```
  - *Response (201):*
    ```json
    {
      "success": true,
      "message": "Job description created successfully",
      "job": { "job_id": "job_12345", "title": "Data Analyst", ... }
    }
    ```

- **List Jobs:** `GET /api/jobs`
  - *Response (200):* Returns list of all active jobs.

---

### 2. Resume Upload & Parsing

- **Upload Resumes:** `POST /api/resumes/upload`
  - *Content-Type:* `multipart/form-data`
  - *Form Fields:* `resumes` (file inputs), `job_id` (optional target job ID)
  - *Response (201):* Returns extracted candidates and automated match analysis.

- **List Candidates:** `GET /api/candidates`
  - *Response (200):* List of all extracted candidates in MongoDB.

- **Get Candidate Details:** `GET /api/candidates/:id`
  - *Response (200):* Complete candidate profile, extracted skills, education, raw resume text, and match history.

---

### 3. Analysis & Ranking

- **Analyze Candidate:** `POST /api/analyze/:candidate_id`
  - *Request Body:* `{ "job_id": "job_12345" }`
  - *Response (200):* Match percentage, matching skills, missing skills, review notes.

- **Get Results:** `GET /api/results`
  - *Query Parameters:* `job_id`, `search`, `skill`, `min_score`, `status`, `sort`
  - *Response (200):* Filtered and ranked candidates list.

- **Update Recruiter Status:** `POST /api/results/status`
  - *Request Body:* `{ "candidate_id": "cand_123", "status": "Shortlisted by Recruiter" }`
  - *Response (200):* Status confirmation.

- **Dashboard Stats:** `GET /api/stats`
  - *Response (200):* Total resumes, candidates screened, average score, shortlisted count.

---

## 10. Sample Job Description & Resume Workflow

### Sample Job Description:
- **Title:** Data Analyst
- **Required Skills:** Python, SQL, Excel, Power BI, Statistics, Tableau
- **Min Experience:** 2 Years

### Sample Candidate (Vamsi Dhar Reddy):
- **Extracted Skills:** Python, SQL, Power BI, Excel, Java, Pandas, Statistics
- **Extracted Experience:** 2.0 Years
- **Matching Skills:** ✓ Python, ✓ SQL, ✓ Power BI, ✓ Excel, ✓ Statistics
- **Missing Skills:** ✗ Tableau
- **Resume Match Score:** **87%**
- **Decision Support:** Recommended for interview; verify Tableau proficiency during technical assessment.

---

## 11. AI & NLP Scoring Methodology

The overall match score $S_{\text{total}}$ is computed transparently:

$$S_{\text{total}} = (S_{\text{skill}} \times 0.45) + (S_{\text{semantic}} \times 0.30) + (S_{\text{exp}} \times 0.15) + (S_{\text{edu}} \times 0.10)$$

Where:
1. **$S_{\text{skill}}$ (45%):** Ratio of matching required skills found in the candidate resume ($\frac{|\text{Candidate} \cap \text{Required}|}{|\text{Required}|} \times 100$).
2. **$S_{\text{semantic}}$ (30%):** Cosine similarity between sentence embeddings of the Job Description and the resume body.
3. **$S_{\text{exp}}$ (15%):** Proportional credit for candidate's verified years of experience versus minimum required experience.
4. **$S_{\text{edu}}$ (10%):** Alignment of detected degree credentials (e.g. B.Tech, Master, Ph.D.).

---

## 12. College Demo & Viva Q&A Guide

**Q1: Which NLP models are used for semantic similarity?**
> *Answer:* We use `Sentence Transformers` (`all-MiniLM-L6-v2`) to generate 384-dimensional dense semantic vectors and compute cosine similarity, capturing contextual domain relevance beyond simple keyword search.

**Q2: How does the system handle skill variations like "py" vs "Python"?**
> *Answer:* A canonical dictionary in `ai/skill_database.json` normalizes aliases and abbreviations into canonical skill identifiers prior to set comparison.

**Q3: Does the AI make final hiring or rejection decisions?**
> *Answer:* No. The system strictly provides transparent decision support. Recruiters retain authority over status changes (Shortlist, Review, Hold).

---

## 13. Troubleshooting

- **Error: `pdfplumber` or `python-docx` not found:** Run `pip install -r requirements.txt`.
- **Port 5000 already in use:** Change `PORT=5001` in `.env`.
- **Missing MongoDB:** The built-in local fallback store automatically activates, allowing the system to run without an active MongoDB server.
