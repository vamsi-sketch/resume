"""
NLP Model Service Interface
"""
import os
import json
import logging
from ai.embeddings import get_semantic_similarity

logger = logging.getLogger(__name__)

class NLPModelService:
    def __init__(self):
        self.skill_db_path = os.path.join(os.path.dirname(__file__), "skill_database.json")
        self.skills_list = []
        self.synonyms = {}
        self._load_skill_database()

    def _load_skill_database(self):
        if os.path.exists(self.skill_db_path):
            try:
                with open(self.skill_db_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.skills_list = data.get("skills", [])
                    self.synonyms = data.get("synonyms", {})
            except Exception as e:
                logger.error(f"Error reading skill database: {e}")

    def calculate_text_similarity(self, resume_text: str, job_description: str) -> float:
        """Returns semantic match ratio (0.0 to 1.0) between resume and job description."""
        return get_semantic_similarity(resume_text, job_description)

nlp_service = NLPModelService()
