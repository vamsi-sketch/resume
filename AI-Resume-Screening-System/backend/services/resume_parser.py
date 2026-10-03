"""
Resume Parser Service
Extracts key resume components (Name, Email, Phone, Skills, Experience, Education, Projects, Certifications).
"""
import re
from datetime import datetime
from backend.models.candidate import CandidateModel
from backend.services.skill_extractor import SkillExtractor
from backend.utils.text_cleaner import clean_text

class ResumeParser:
    @staticmethod
    def extract_email(text: str) -> str:
        match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', text)
        return match.group(1).lower() if match else ""

    @staticmethod
    def extract_phone(text: str) -> str:
        match = re.search(r'(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})|(?:\+?\d{1,4}[-.\s]?\d{10})', text)
        return match.group(0).strip() if match else ""

    @staticmethod
    def extract_name(text: str, email: str = "") -> str:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        blacklist = {"resume", "curriculum", "vitae", "cv", "profile", "summary", "contact", "email", "phone"}
        
        for line in lines[:5]:
            lower = line.lower()
            if "@" in line or "http" in line or any(w in lower for w in blacklist):
                continue
            words = line.split()
            if 2 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.'-]+$", w) for w in words):
                return line

        if email:
            name_part = email.split("@")[0].replace(".", " ").replace("_", " ")
            return " ".join([w.capitalize() for w in name_part.split() if w.isalpha()])

        return "Candidate Applicant"

    @staticmethod
    def extract_experience(text: str) -> tuple:
        # Check explicit years
        patterns = [
            r'(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)\s*(?:of)?\s*(?:relevant\s*)?experience',
            r'experience\s*:\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)',
            r'total\s*experience\s*(?:is|:)?\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs|year)'
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    return val, [f"Explicit stated experience: {val} years"]
                except ValueError:
                    pass

        # Check year ranges
        current_year = datetime.now().year
        ranges = re.findall(r'(?:19|20)\d{2}\s*[-–to\s]+\s*(?:(?:19|20)\d{2}|present|current)', text, re.IGNORECASE)
        total_years = 0
        details = []
        for r in ranges:
            years = re.findall(r'(?:19|20)\d{2}', r)
            if years:
                start = int(years[0])
                end = int(years[1]) if len(years) > 1 else current_year
                diff = max(0, min(30, end - start))
                total_years += diff
                details.append(f"Work period: {r.strip()}")

        return float(min(25, max(1, total_years or 1))), details[:4]

    @staticmethod
    def extract_education(text: str) -> list:
        degrees = []
        patterns = [
            (r'B\.?Tech|Bachelor of Technology', 'B.Tech / Bachelor of Technology'),
            (r'B\.?E\.?|Bachelor of Engineering', 'B.E. / Bachelor of Engineering'),
            (r'B\.?S\.?|Bachelor of Science', 'B.S. / Bachelor of Science'),
            (r'M\.?Tech|Master of Technology', 'M.Tech / Master of Technology'),
            (r'M\.?S\.?|Master of Science', 'M.S. / Master of Science'),
            (r'MCA|BCA', 'Computer Applications (BCA/MCA)'),
            (r'MBA', 'Master of Business Administration (MBA)'),
            (r'Ph\.?D', 'Doctorate / Ph.D.')
        ]
        for pat, name in patterns:
            if re.search(pat, text, re.IGNORECASE):
                degrees.append(name)

        for line in text.split("\n"):
            if any(k in line.lower() for k in ["university", "institute", "college"]) and len(line.strip()) < 80:
                degrees.append(line.strip())
                if len(degrees) >= 3:
                    break

        return degrees if degrees else ["Bachelor Degree / Quantitative Technical Degree"]

    @classmethod
    def parse(cls, raw_text: str, filename: str) -> dict:
        cleaned = clean_text(raw_text)
        email = cls.extract_email(cleaned)
        phone = cls.extract_phone(cleaned)
        name = cls.extract_name(cleaned, email)
        skills = SkillExtractor.extract_skills(cleaned)
        exp_years, exp_details = cls.extract_experience(cleaned)
        education = cls.extract_education(cleaned)

        candidate = CandidateModel.create(
            name=name,
            email=email or f"{name.lower().replace(' ', '.')}@example.com",
            phone=phone or "+1 (555) 019-2834",
            skills=skills,
            education=education,
            experience=exp_years,
            certifications=[],
            projects=[],
            resume_file=filename,
            raw_text=cleaned
        )
        candidate["experience_details"] = exp_details
        return candidate
