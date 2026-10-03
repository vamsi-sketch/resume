"""
MongoDB Database Connection and Collection Manager
Connects to MongoDB using pymongo.
Includes resilient fallback storage for local demonstration if MongoDB service is not running.
"""
import sys
import os
import json
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from backend.config import Config

logger = logging.getLogger(__name__)

class DatabaseManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self.is_connected = False
        self.client = None
        self.db = None
        
        # Local JSON fallback storage for effortless student demo
        self.fallback_file = os.path.join(os.path.dirname(__file__), "local_demo_store.json")
        self.fallback_data = {"candidates": [], "jobs": [], "analysis": []}
        self._load_fallback()

        try:
            self.client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[Config.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Connected successfully to MongoDB database: {Config.DATABASE_NAME}")
            print(f"[Database] Connected to MongoDB: {Config.DATABASE_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_connected = False
            logger.warning(f"MongoDB not available ({e}). Running in resilient Local Demo Fallback mode.")
            print(f"[Database] MongoDB not detected locally ({e}). Using built-in local persistence storage.")

    def _load_fallback(self):
        if os.path.exists(self.fallback_file):
            try:
                with open(self.fallback_file, "r", encoding="utf-8") as f:
                    self.fallback_data = json.load(f)
            except Exception:
                pass

    def _save_fallback(self):
        try:
            with open(self.fallback_file, "w", encoding="utf-8") as f:
                json.dump(self.fallback_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save fallback database: {e}")

    # Collection Accessors
    def get_collection(self, name):
        if self.is_connected and self.db is not None:
            return self.db[name]
        return FallbackCollection(name, self)

class FallbackCollection:
    """Simulates basic PyMongo collection queries when standalone MongoDB server is absent."""
    def __init__(self, name, db_mgr):
        self.name = name
        self.mgr = db_mgr
        if name not in self.mgr.fallback_data:
            self.mgr.fallback_data[name] = []

    def insert_one(self, doc):
        data = dict(doc)
        if "_id" in data:
            data["_id"] = str(data["_id"])
        self.mgr.fallback_data[self.name].append(data)
        self.mgr._save_fallback()
        class Result:
            inserted_id = data.get("candidate_id") or data.get("job_id") or data.get("_id")
        return Result()

    def find(self, query=None, projection=None):
        items = self.mgr.fallback_data.get(self.name, [])
        if not query:
            return items
        filtered = []
        for item in items:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                filtered.append(item)
        return filtered

    def find_one(self, query):
        items = self.find(query)
        return items[0] if items else None

    def update_one(self, filter_query, update_doc):
        items = self.mgr.fallback_data.get(self.name, [])
        set_vals = update_doc.get("$set", {})
        for item in items:
            match = True
            for k, v in filter_query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                item.update(set_vals)
                self.mgr._save_fallback()
                return True
        return False

    def count_documents(self, query=None):
        return len(self.find(query))

db_manager = DatabaseManager()

def get_db():
    return db_manager
