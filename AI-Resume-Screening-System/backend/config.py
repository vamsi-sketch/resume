"""
Application Configuration Module
Loads environment variables and sets Flask/MongoDB configurations.
"""
import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    SECRET_KEY = os.getenv("SECRET_KEY", "recruiter_ai_secret_key_2025")
    
    # MongoDB Config
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/resume_screening_db")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "resume_screening_db")
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))
    ALLOWED_EXTENSIONS = set(os.getenv("ALLOWED_EXTENSIONS", "pdf,docx").split(","))

    # NLP Model Config
    NLP_MODEL_NAME = os.getenv("NLP_MODEL_NAME", "all-MiniLM-L6-v2")
    SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", 0.65))

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
