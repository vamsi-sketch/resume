"""
AI Skill Extraction Service
Identifies technical and professional skills from resume text using semantic dictionary and regex boundary tokens.
"""
import re
from ai.nlp_model import nlp_service

class SkillExtractor:
    @staticmethod
    def extract_skills(text: str) -> list:
        if not text:
            return []

        text_lower = " " + text.lower().replace("\n", " ") + " "
        found_skills = set()

        # Check all master skills
        for skill in nlp_service.skills_list:
            escaped = re.escape(skill.lower())
            pattern = rf"(?:^|[\s,;()\/]){escaped}(?:$|[\s,;()\/])"
            if re.search(pattern, text_lower):
                found_skills.add(skill)

        # Check synonyms
        for synonym, canonical in nlp_service.synonyms.items():
            escaped = re.escape(synonym.lower())
            pattern = rf"(?:^|[\s,;()\/]){escaped}(?:$|[\s,;()\/])"
            if re.search(pattern, text_lower):
                found_skills.add(canonical)

        return sorted(list(found_skills))

    @staticmethod
    def match_skills(candidate_skills: list, required_skills: list):
        """Compares candidate skills against job required skills and returns matching and missing sets."""
        cand_normalized = {s.strip().lower(): s for s in candidate_skills}
        matching = []
        missing = []

        for req in required_skills:
            req_clean = req.strip()
            req_lower = req_clean.lower()
            
            # Check direct or synonym match
            synonym_mapped = nlp_service.synonyms.get(req_lower, req_clean).lower()
            if req_lower in cand_normalized or synonym_mapped in cand_normalized:
                matching.append(req_clean)
            else:
                missing.append(req_clean)

        return matching, missing
