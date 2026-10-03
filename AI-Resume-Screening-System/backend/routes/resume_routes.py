"""
Resume Upload & Candidate Routes
POST /api/resumes/upload
GET /api/candidates
GET /api/candidates/:id
"""
import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from backend.config import Config
from backend.utils.pdf_reader import extract_document_text
from backend.services.resume_parser import ResumeParser
from backend.services.resume_matcher import ResumeMatcher
from database.database import get_db

resume_bp = Blueprint('resume_bp', __name__)
db_mgr = get_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@resume_bp.route('/api/resumes/upload', methods=['POST'])
def upload_resumes():
    if 'resumes' not in request.files and 'file' not in request.files:
        return jsonify({"error": "No resume files uploaded."}), 400

    files = request.files.getlist('resumes') or request.files.getlist('file')
    if not files or files[0].filename == '':
        return jsonify({"error": "No selected files."}), 400

    target_job_id = request.form.get("job_id")
    jobs_col = db_mgr.get_collection("jobs")
    target_job = None
    if target_job_id:
        target_job = jobs_col.find_one({"job_id": target_job_id})
    if not target_job:
        all_jobs = jobs_col.find()
        if all_jobs:
            target_job = all_jobs[0]

    uploaded_candidates = []
    errors = []

    cand_col = db_mgr.get_collection("candidates")
    analysis_col = db_mgr.get_collection("analysis")

    for file in files:
        if not file or not allowed_file(file.filename):
            errors.append(f"{file.filename}: Invalid format. Allowed: PDF, DOCX.")
            continue

        filename = secure_filename(file.filename)
        saved_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        file.save(saved_path)

        try:
            raw_text = extract_document_text(saved_path)
            if not raw_text or len(raw_text.strip()) < 20:
                errors.append(f"{filename}: File could not be read or is empty.")
                continue

            candidate_doc = ResumeParser.parse(raw_text, filename)
            cand_col.insert_one(candidate_doc)
            uploaded_candidates.append(candidate_doc)

            # Auto-screen if target job exists
            if target_job:
                analysis_doc = ResumeMatcher.match_resume_to_job(candidate_doc, target_job)
                analysis_col.insert_one(analysis_doc)

        except Exception as e:
            errors.append(f"{filename}: Parsing failed ({str(e)})")

    return jsonify({
        "success": len(uploaded_candidates) > 0,
        "message": f"Successfully processed {len(uploaded_candidates)} resume(s).",
        "candidates": uploaded_candidates,
        "errors": errors if errors else None
    }), 201

@resume_bp.route('/api/candidates', methods=['GET'])
def get_candidates():
    cand_col = db_mgr.get_collection("candidates")
    candidates = cand_col.find()
    cleaned = []
    for c in candidates:
        item = dict(c)
        if "_id" in item:
            item["_id"] = str(item["_id"])
        cleaned.append(item)
    return jsonify({"success": True, "count": len(cleaned), "candidates": cleaned}), 200

@resume_bp.route('/api/candidates/<candidate_id>', methods=['GET'])
def get_candidate_details(candidate_id):
    cand_col = db_mgr.get_collection("candidates")
    candidate = cand_col.find_one({"candidate_id": candidate_id})
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    item = dict(candidate)
    if "_id" in item:
        item["_id"] = str(item["_id"])

    # Fetch associated analysis history
    analysis_col = db_mgr.get_collection("analysis")
    analyses = analysis_col.find({"candidate_id": candidate_id})
    cleaned_analyses = []
    for a in analyses:
        a_item = dict(a)
        if "_id" in a_item:
            a_item["_id"] = str(a_item["_id"])
        cleaned_analyses.append(a_item)

    return jsonify({"success": True, "candidate": item, "analyses": cleaned_analyses}), 200
