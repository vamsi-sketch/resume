"""
Candidate Results, Matching & Dashboard Stats Routes
POST /api/analyze/:candidate_id
GET /api/results
POST /api/results/status
GET /api/stats
"""
from flask import Blueprint, request, jsonify
from database.database import get_db
from backend.services.resume_matcher import ResumeMatcher

result_bp = Blueprint('result_bp', __name__)
db_mgr = get_db()

@result_bp.route('/api/analyze/<candidate_id>', methods=['POST'])
def analyze_candidate_route(candidate_id):
    cand_col = db_mgr.get_collection("candidates")
    candidate = cand_col.find_one({"candidate_id": candidate_id})
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    data = request.get_json() or {}
    job_id = data.get("job_id")
    jobs_col = db_mgr.get_collection("jobs")
    job = jobs_col.find_one({"job_id": job_id}) if job_id else jobs_col.find_one({})
    if not job:
        return jsonify({"error": "Target job description not found"}), 404

    analysis_doc = ResumeMatcher.match_resume_to_job(candidate, job)
    analysis_col = db_mgr.get_collection("analysis")
    analysis_col.insert_one(analysis_doc)

    item = dict(analysis_doc)
    if "_id" in item:
        item["_id"] = str(item["_id"])
    return jsonify({"success": True, "analysis": item}), 200

@result_bp.route('/api/results', methods=['GET'])
def get_results():
    job_id = request.args.get("job_id")
    search = request.args.get("search", "").lower()
    skill_filter = request.args.get("skill", "").lower()
    min_score = request.args.get("min_score")
    status_filter = request.args.get("status")
    sort_by = request.args.get("sort", "score")

    analysis_col = db_mgr.get_collection("analysis")
    query = {"job_id": job_id} if job_id else {}
    results = analysis_col.find(query)

    filtered = []
    for r in results:
        item = dict(r)
        if "_id" in item:
            item["_id"] = str(item["_id"])

        # Search filter
        if search:
            name = item.get("candidate_name", "").lower()
            email = item.get("candidate_email", "").lower()
            if search not in name and search not in email:
                continue

        # Skill filter
        if skill_filter:
            matching = [s.lower() for s in item.get("matching_skills", [])]
            if not any(skill_filter in s for s in matching):
                continue

        # Min score filter
        if min_score:
            try:
                if item.get("match_score", 0) < float(min_score):
                    continue
            except ValueError:
                pass

        # Status filter
        if status_filter and status_filter != "all":
            if item.get("status") != status_filter:
                continue

        filtered.append(item)

    # Sort
    if sort_by == "experience":
        filtered.sort(key=lambda x: x.get("candidate_experience", 0), reverse=True)
    elif sort_by == "name":
        filtered.sort(key=lambda x: x.get("candidate_name", ""))
    elif sort_by == "date":
        filtered.sort(key=lambda x: x.get("analysis_date", ""), reverse=True)
    else:
        filtered.sort(key=lambda x: x.get("match_score", 0), reverse=True)

    return jsonify({"success": True, "count": len(filtered), "results": filtered}), 200

@result_bp.route('/api/results/status', methods=['POST'])
def update_status():
    data = request.get_json() or {}
    candidate_id = data.get("candidate_id")
    status = data.get("status")

    if not candidate_id or not status:
        return jsonify({"error": "candidate_id and status are required"}), 400

    cand_col = db_mgr.get_collection("candidates")
    analysis_col = db_mgr.get_collection("analysis")

    cand_col.update_one({"candidate_id": candidate_id}, {"$set": {"status": status}})
    analysis_col.update_one({"candidate_id": candidate_id}, {"$set": {"status": status}})

    return jsonify({"success": True, "message": f"Candidate status updated to {status}"}), 200

@result_bp.route('/api/stats', methods=['GET'])
def get_stats():
    job_id = request.args.get("job_id")
    cand_col = db_mgr.get_collection("candidates")
    analysis_col = db_mgr.get_collection("analysis")

    total_resumes = cand_col.count_documents()
    query = {"job_id": job_id} if job_id else {}
    target_results = analysis_col.find(query)
    candidates_screened = len(target_results)

    avg_score = 0
    if candidates_screened > 0:
        total_scores = sum(r.get("match_score", 0) for r in target_results)
        avg_score = round(total_scores / candidates_screened)

    shortlisted = len(cand_col.find({"status": "Shortlisted by Recruiter"}))
    recent = cand_col.find()[-5:]
    recent_cleaned = []
    for c in reversed(recent):
        item = dict(c)
        if "_id" in item:
            item["_id"] = str(item["_id"])
        recent_cleaned.append(item)

    return jsonify({
        "success": True,
        "stats": {
            "total_resumes": total_resumes,
            "candidates_screened": candidates_screened,
            "average_match_score": avg_score,
            "shortlisted_candidates": shortlisted,
            "recent_applications": recent_cleaned
        }
    }), 200
