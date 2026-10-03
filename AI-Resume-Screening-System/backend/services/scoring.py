"""
Transparent Scoring and Decision-Support Engine
Computes multi-factor weighted match score without making automated hiring rejections.
"""

class ScoringEngine:
    @staticmethod
    def calculate_score(skill_match_ratio: float, semantic_similarity: float, exp_candidate: float, exp_required: float, edu_match: float = 0.85):
        """
        Weights:
        - Skills: 45%
        - Semantic NLP Content Similarity: 30%
        - Experience Alignment: 15%
        - Education: 10%
        """
        # 1. Skill Score (0 to 100)
        skill_score = skill_match_ratio * 100.0

        # 2. Semantic Similarity Score (0 to 100)
        semantic_score = semantic_similarity * 100.0

        # 3. Experience Score (0 to 100)
        if exp_required <= 0:
            exp_score = 100.0
        elif exp_candidate >= exp_required:
            exp_score = 100.0
        else:
            exp_score = max(40.0, (exp_candidate / exp_required) * 100.0)

        # 4. Education Score (0 to 100)
        education_score = edu_match * 100.0

        composite = (
            (skill_score * 0.45) +
            (semantic_score * 0.30) +
            (exp_score * 0.15) +
            (education_score * 0.10)
        )

        final_score = int(round(min(99.0, max(25.0, composite))))

        # Decision support rationale
        if final_score >= 80:
            notes = "Strong candidate profile. High skill and semantic overlap with target job description."
        elif final_score >= 65:
            notes = "Moderate candidate profile. Core competencies present; review missing skill requirements."
        else:
            notes = "Lower match profile. Significant skill or domain divergences found. Decision remains with recruiter."

        return {
            "match_score": final_score,
            "skill_match_score": round(skill_score, 1),
            "semantic_similarity_score": round(semantic_score, 1),
            "experience_score": round(exp_score, 1),
            "education_score": round(education_score, 1),
            "decision_support_notes": notes
        }
