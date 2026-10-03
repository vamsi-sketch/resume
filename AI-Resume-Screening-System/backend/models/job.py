"""
Job Description Data Model for MongoDB
"""
from datetime import datetime
import uuid

class JobModel:
    @staticmethod
    def create(title, description, required_skills, experience=0, department="General", education="Bachelor Degree"):
        if isinstance(required_skills, str):
            required_skills = [s.strip() for s in required_skills.split(",") if s.strip()]

        return {
            "job_id": f"job_{uuid.uuid4().hex[:8]}",
            "title": title.strip(),
            "department": department.strip(),
            "description": description.strip(),
            "required_skills": required_skills or [],
            "experience": float(experience or 0.0),
            "education": education.strip(),
            "created_at": datetime.utcnow().isoformat()
        }
