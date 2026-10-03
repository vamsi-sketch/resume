"""
Candidate Data Model for MongoDB
"""
from datetime import datetime
import uuid

class CandidateModel:
    @staticmethod
    def create(name, email, phone, skills, education, experience, certifications, projects, resume_file, raw_text=""):
        return {
            "candidate_id": f"cand_{uuid.uuid4().hex[:8]}",
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills or [],
            "education": education or [],
            "experience": float(experience or 0.0),
            "certifications": certifications or [],
            "projects": projects or [],
            "resume_file": resume_file,
            "raw_text": raw_text,
            "status": "Review",
            "uploaded_date": datetime.utcnow().isoformat()
        }
