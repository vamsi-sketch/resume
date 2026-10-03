"""
Main Flask Server Entry Point
AI-Based Resume Screening and Candidate Matching System
"""
import sys
import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.config import Config
from backend.routes.job_routes import job_bp
from backend.routes.resume_routes import resume_bp
from backend.routes.result_routes import result_bp
from database.database import get_db

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# Register API blueprints
app.register_blueprint(job_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(result_bp)

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

def seed_sample_data():
    """Initializes sample demonstration jobs and candidate profiles."""
    db_mgr = get_db()
    jobs_col = db_mgr.get_collection("jobs")
    if jobs_col.count_documents() == 0:
        sample_job = {
            "job_id": "job_sample_data_analyst",
            "title": "Data Analyst",
            "department": "Business Intelligence & Analytics",
            "description": "We are seeking a detail-oriented Data Analyst to interpret datasets, build automated dashboards in Power BI and Tableau, and write optimized SQL queries.",
            "required_skills": ["Python", "SQL", "Excel", "Power BI", "Statistics", "Tableau"],
            "experience": 2.0,
            "education": "Bachelor Degree in Computer Science, Math, or Quantitative Field",
            "created_at": "2025-01-15T10:00:00Z"
        }
        jobs_col.insert_one(sample_job)

        cand_col = db_mgr.get_collection("candidates")
        cand1 = {
            "candidate_id": "cand_sample_vamsi",
            "name": "Vamsi Dhar Reddy",
            "email": "candidate@example.com",
            "phone": "+1 (555) 349-8821",
            "skills": ["Python", "SQL", "Power BI", "Excel", "Java", "Statistics"],
            "education": ["B.Tech in Computer Science and Engineering", "JNTU College of Engineering"],
            "experience": 2.0,
            "experience_details": ["Associate Data Analyst at CloudMetrics Corp (2022 - Present)"],
            "certifications": ["Power BI Data Analyst Associate"],
            "projects": ["Customer Churn Prediction Dashboard in Python & Power BI"],
            "resume_file": "Vamsi_Dhar_Reddy_Resume.pdf",
            "raw_text": "VAMSI DHAR REDDY candidate@example.com Python SQL Power BI Excel Java Statistics Data Analyst",
            "status": "Shortlisted by Recruiter",
            "uploaded_date": "2025-01-16T12:00:00Z"
        }
        cand_col.insert_one(cand1)

        from backend.services.resume_matcher import ResumeMatcher
        analysis_col = db_mgr.get_collection("analysis")
        analysis_col.insert_one(ResumeMatcher.match_resume_to_job(cand1, sample_job))

if __name__ == "__main__":
    seed_sample_data()
    print(f"🚀 AI Resume Screening Server started on port {Config.PORT}")
    print(f"🌐 Access Web Dashboard: http://localhost:{Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
