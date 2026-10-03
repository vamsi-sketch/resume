"""
Text Cleaning and Normalization Utilities
"""
import re

def clean_text(text: str) -> str:
    """Removes irregular characters, excessive whitespace, and standardizes newlines."""
    if not text:
        return ""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove unprintable control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)
    return text.strip()

def tokenize_and_clean(text: str) -> list:
    """Lowercases and cleans text into alphanumerical token sequence."""
    if not text:
        return []
    cleaned = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text.lower())
    return [t for t in cleaned.split() if len(t) > 1]
