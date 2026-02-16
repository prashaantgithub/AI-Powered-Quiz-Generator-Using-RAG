import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "HNRS Adaptive Quiz Generator"
    API_V1_STR: str = "/api"
    
    # Paths
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/quiz.db")
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", "./data/uploads"))
    INDEX_DIR: Path = Path(os.getenv("INDEX_DIR", "./data/indices"))
    
    # AI Config (Offline)
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    def create_dirs(self):
        """Ensure critical directories exist on startup."""
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.INDEX_DIR.mkdir(parents=True, exist_ok=True)
        # Create models dir if not exists (parent of model path)
        Path(self.MODEL_PATH).parent.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.create_dirs()