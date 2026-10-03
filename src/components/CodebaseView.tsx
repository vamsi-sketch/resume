import React, { useState } from 'react';
import { FileCode2, Copy, Check, Folder, File, Layers, HelpCircle, Terminal } from 'lucide-react';

export const CodebaseView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('backend/app.py');
  const [copied, setCopied] = useState(false);

  const fileContents: Record<string, string> = {
    'backend/app.py': `"""
Main Flask Server Entry Point
AI-Based Resume Screening and Candidate Matching System
"""
import sys, os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from backend.config import Config
from backend.routes.job_routes import job_bp
from backend.routes.resume_routes import resume_bp
from backend.routes.result_routes import result_bp
from database.database import get_db

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# Register REST API Blueprints
app.register_blueprint(job_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(result_bp)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    print(f"🚀 AI Resume Screening Server on port {Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)`,

    'backend/services/resume_matcher.py': `"""
AI Resume-to-Job Matching Engine
Calculates weighted match score across skills, semantic similarity,
experience tenure, and education credentials.
"""
from backend.services.skill_extractor import SkillExtractor
from ai.embeddings import compute_semantic_similarity

class ResumeMatcher:
    @staticmethod
    def match_resume_to_job(candidate_data, job_data):
        req_skills = job_data.get("required_skills", [])
        cand_skills = candidate_data.get("skills", [])
        
        # 1. Skill Match (45% Weight)
        matching, missing = SkillExtractor.compare_skills(cand_skills, req_skills)
        skill_score = (len(matching) / len(req_skills) * 100) if req_skills else 100.0

        # 2. Semantic Text Cosine Similarity (30% Weight)
        raw_text = candidate_data.get("raw_text", "")
        job_text = f"{job_data.get('title')} {job_data.get('description')}"
        semantic_sim = compute_semantic_similarity(raw_text, job_text)
        semantic_score = round(semantic_sim * 100, 1)

        # 3. Experience Match (15% Weight)
        cand_exp = candidate_data.get("experience", 0.0)
        req_exp = job_data.get("experience", 0.0)
        exp_score = min(100.0, (cand_exp / req_exp * 100.0)) if req_exp > 0 else 100.0

        # 4. Education Match (10% Weight)
        edu_score = 90.0 if candidate_data.get("education") else 70.0

        # Overall Weighted Score Calculation
        overall = round((skill_score * 0.45) + (semantic_score * 0.30) + (exp_score * 0.15) + (edu_score * 0.10))
        return {
            "candidate_id": candidate_data["candidate_id"],
            "job_id": job_data["job_id"],
            "match_score": overall,
            "matching_skills": matching,
            "missing_skills": missing
        }`,

    'database/database.py': `"""
MongoDB Database Connection Handler with PyMongo & Local Demo Fallback
"""
import os
import json
from pymongo import MongoClient

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.use_local_fallback = False
        self.init_connection()

    def init_connection(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/resume_screening_db")
        db_name = os.getenv("DATABASE_NAME", "resume_screening_db")
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            self.client.server_info() # Verify live connection
            self.db = self.client[db_name]
        except Exception:
            # Resilient in-memory/JSON store if MongoDB service is not started
            self.use_local_fallback = True

    def get_collection(self, name):
        if not self.use_local_fallback:
            return self.db[name]
        return LocalCollectionProxy(name)`,

    'requirements.txt': `flask==3.0.2
flask-cors==4.0.0
pymongo==4.6.2
python-dotenv==1.0.1
pypdf2==3.0.1
pdfplumber==0.10.3
python-docx==1.1.0
scikit-learn==1.4.1.post1
sentence-transformers==2.5.1
torch>=2.0.0
werkzeug==3.0.1`,

    'README.md': `# AI-Based Resume Screening and Candidate Matching System
Complete Python Flask, Sentence Transformers, pdfplumber, and MongoDB architecture.
See full README.md in root for installation, pipeline execution, and MongoDB guide.`
  };

  const copyCode = () => {
    const text = fileContents[selectedFile] || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview & Architecture Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Full Architecture &amp; Python Codebase</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Standalone Python (Flask) &amp; MongoDB Architecture Explorer
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          The requested Python Flask + MongoDB architecture is completely built in{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">/AI-Resume-Screening-System</code>.
          Below you can inspect the Python server routes, NLP sentence-transformers matching engine, MongoDB connection adapters, and presentation Viva Q&amp;A.
        </p>

        {/* Quick Launch Box */}
        <div className="mt-4 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>cd AI-Resume-Screening-System && pip install -r requirements.txt && python backend/app.py</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Port 5000</span>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: File Tree */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-indigo-600" />
            <span>Python Files</span>
          </h3>
          <div className="space-y-1 text-xs">
            {Object.keys(fileContents).map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                  selectedFile === file
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <File className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
            <span className="font-mono">{selectedFile}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[420px] overflow-y-auto">
            {fileContents[selectedFile]}
          </pre>
        </div>
      </div>

      {/* Viva / Project Presentation Guide */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>College Demo &amp; Viva Q&amp;A Defense Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">Q: Why Sentence Transformers instead of keyword search?</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Simple keyword matching fails when resumes use synonyms or different terminology. Dense sentence embeddings encode semantic meaning into a 384-dimensional vector space where cosine similarity captures contextual alignment.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">Q: How does the scoring formula prevent black-box bias?</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The algorithm breaks evaluation into 4 explicit, inspectable weights: Skills (45%), Semantic similarity (30%), Experience (15%), and Education (10%). Every decision offers recruiter override.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">Q: How is MongoDB organized?</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Three collections: <code className="text-indigo-600">candidates</code> for parsed profiles, <code className="text-indigo-600">jobs</code> for requirements, and <code className="text-indigo-600">analysis</code> for computed scores and skill gap records.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">Q: How do you handle PDF and DOCX extraction?</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              In Python, <code className="text-indigo-600">pdfplumber</code> extracts structured multi-column text and tables, while <code className="text-indigo-600">python-docx</code> reads document XML paragraphs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
