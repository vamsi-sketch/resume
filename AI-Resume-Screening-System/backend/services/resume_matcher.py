"""
AI Resume Matcher Service
Connects skill extraction, semantic NLP embeddings, and scoring calculation.
"""
from datetime import datetime
from backend.services.skill_extractor import SkillExtractor
from backend.services.scoring import ScoringEngine
from ai.nlp_model import nlp_service

class ResumeMatcher:
    @staticmethod
    def match_resume_to_job(candidate: dict, job: dict) -> dict:
        required_skills = job.get("required_skills", [])
        candidate_skills = candidate.get("skills", [])
        
        matching_skills, missing_skills = SkillExtractor.match_skills(candidate_skills, required_skills)
        
        total_req = len(required_skills) if required_skills else 1
        skill_ratio = len(matching_skills) / total_req

        # Semantic similarity between resume text and JD
        job_full_text = f"{job.get('title', '')} {job.get('description', '')} {' '.join(required_skills)}"
        resume_text = candidate.get("raw_text", "")
        semantic_sim = nlp_service.calculate_text_similarity(resume_text, job_full_text)

        exp_candidate = candidate.get("experience", 0.0)
        exp_required = job.get("experience", 0.0)

        # Education match heuristic
        edu_str = " ".join(candidate.get("education", [])).lower()
        edu_score = 0.90 if ("bachelor" in edu_str or "b.tech" in edu_str or "b.e" in edu_str or "master" in edu_str) else 0.75

        score_data = ScoringEngine.calculate_score(
            skill_match_ratio=skill_ratio,
            semantic_similarity=semantic_sim,
            exp_candidate=exp_candidate,
            exp_required=exp_required,
            edu_match=edu_score
        )

        areas_to_review = []
        if missing_skills:
            areas_to_review.append(f"Missing required skills: {', '.join(missing_skills[:3])}")
        if exp_candidate < exp_required:
            areas_to_review.append(f"Experience: {exp_candidate} yrs vs {exp_required} yrs required")
        if not areas_to_review:
            areas_to_review.append("Comprehensive alignment with job requirements")

        relevant_exp = f"{exp_candidate} Years overall experience"
        if candidate.get("experience_details"):
            relevant_exp += f" ({candidate['experience_details'][0]})"

        return {
            "analysis_id": f"an_{candidate.get('candidate_id')}_{job.get('job_id')}",
            "candidate_id": candidate.get("candidate_id"),
            "job_id": job.get("job_id"),
            "candidate_name": candidate.get("name"),
            "candidate_email": candidate.get("email"),
            "candidate_experience": exp_candidate,
            "job_title": job.get("title"),
            "match_score": score_data["match_score"],
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "skill_match_score": score_data["skill_match_score"],
            "semantic_similarity_score": score_data["semantic_similarity_score"],
            "experience_score": score_data["experience_score"],
            "education_score": score_data["education_score"],
            "relevant_experience": relevant_exp,
            "areas_to_review": areas_to_review,
            "decision_support_notes": score_data["decision_support_notes"],
            "analysis_date": datetime.utcnow().isoformat(),
            "status": candidate.get("status", "Review")
        }
