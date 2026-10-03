"""
AI Semantic Embeddings Module
Uses Sentence Transformers ('all-MiniLM-L6-v2') for deep semantic vector embeddings.
Includes optimized TF-IDF / Cosine Similarity mathematical fallback when PyTorch/Transformers are downloading or absent.
"""
import numpy as np
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class SemanticEmbeddingEngine:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded SentenceTransformer: {self.model_name}")
        except Exception as e:
            logger.warning(f"SentenceTransformer not initialized ({e}). Using optimized TF-IDF vector similarity.")
            self.model = None

    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """
        Computes semantic similarity between two texts.
        Returns a float between 0.0 and 1.0.
        """
        if not text_a or not text_b:
            return 0.0

        # Method 1: Sentence Transformers (Dense Vector Semantic Cosine)
        if self.model is not None:
            try:
                emb_a = self.model.encode([text_a])
                emb_b = self.model.encode([text_b])
                sim = cosine_similarity(emb_a, emb_b)[0][0]
                return float(max(0.0, min(1.0, sim)))
            except Exception as e:
                logger.warning(f"SentenceTransformer encoding error: {e}. Falling back to TF-IDF.")

        # Method 2: Scikit-learn TF-IDF with character and word n-grams
        try:
            vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=5000,
                sublinear_tf=True
            )
            tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Normalize to realistic semantic range
            normalized_sim = min(1.0, max(0.0, sim * 1.8))
            return float(normalized_sim)
        except Exception as e:
            logger.error(f"TF-IDF similarity failed: {e}")
            return 0.5

embedding_engine = SemanticEmbeddingEngine()

def get_semantic_similarity(text1: str, text2: str) -> float:
    return embedding_engine.compute_similarity(text1, text2)
