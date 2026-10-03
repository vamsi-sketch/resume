"""
Job Description Routes
POST /api/jobs
GET /api/jobs
"""
from flask import Blueprint, request, jsonify
from database.database import get_db
from backend.models.job import JobModel
from backend.services.resume_matcher import ResumeMatcher

job_bp = Blueprint('job_bp', __name__)
db_mgr = get_db()

@job_bp.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    required_skills = data.get("required_skills", [])
    experience = data.get("experience", 0)

    if not title or not description:
        return jsonify({"error": "Job title and description are required"}), 400

    job_doc = JobModel.create(
        title=title,
        description=description,
        required_skills=required_skills,
        experience=experience,
        department=data.get("department", "General"),
        education=data.get("education", "Bachelor Degree")
    )

    jobs_col = db_mgr.get_collection("jobs")
    jobs_col.insert_one(job_doc)

    # Automatically analyze all existing candidates against this new job
    cand_col = db_mgr.get_collection("candidates")
    analysis_col = db_mgr.get_collection("analysis")
    all_candidates = cand_col.find()

    for cand in all_candidates:
        analysis_doc = ResumeMatcher.match_resume_to_job(cand, job_doc)
        analysis_col.insert_one(analysis_doc)

    return jsonify({"success": True, "message": "Job description created successfully", "job": job_doc}), 201

@job_bp.route('/api/jobs', methods=['GET'])
def get_jobs():
    jobs_col = db_mgr.get_collection("jobs")
    jobs = jobs_col.find()
    # Sanitize _id for JSON output
    cleaned_jobs = []
    for j in jobs:
        item = dict(j)
        if "_id" in item:
            item["_id"] = str(item["_id"])
        cleaned_jobs.append(item)
    return jsonify({"success": True, "count": len(cleaned_jobs), "jobs": cleaned_jobs}), 200
