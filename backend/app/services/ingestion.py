import hashlib
import httpx
from pathlib import Path
from typing import Tuple
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.core import Settings
from app.core.config import settings
from app.core.exceptions import InvalidFileFormat, EmptyContentError, IndexingFailed

class IngestionService:
    def __init__(self):
        self.embed_model = HuggingFaceEmbedding(model_name=settings.EMBEDDING_MODEL_NAME)
        Settings.embed_model = self.embed_model
        Settings.llm = None

    def calculate_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()

    def validate_and_save(self, filename: str, content: bytes) -> Tuple[str, Path]:
        ext = Path(filename).suffix.lower()
        if ext not in [".pdf", ".docx", ".pptx", ".txt"]:
            raise InvalidFileFormat()
        file_hash = self.calculate_hash(content)
        file_path = settings.UPLOAD_DIR / f"{file_hash}{ext}"
        if not file_path.exists():
            with open(file_path, "wb") as f:
                f.write(content)
        return file_hash, file_path

    def generate_title(self, file_path: Path) -> str:
        try:
            with httpx.Client() as client:
                response = client.get("http://localhost:11434/api/tags", timeout=5.0)
                if response.status_code != 200: return file_path.stem

            reader = SimpleDirectoryReader(input_files=[str(file_path)])
            documents = reader.load_data()
            if not documents: return file_path.stem

            sample_text = documents[0].text[:800]
            llm = Ollama(model="llama3.2:1b", request_timeout=30.0)
            prompt = f"Identify the subject of this text. IGNORE university names. Return ONLY a 3-word title. Text: {sample_text}"
            
            response = llm.complete(prompt)
            title = str(response).strip().replace('"', '').replace("'", "")
            if any(x in title.lower() for x in ["christ", "university", "excellence"]):
                return "Domain Assessment"
            return title if len(title) < 40 else "Knowledge Review"
        except Exception:
            return file_path.stem

    def create_index(self, file_hash: str, file_path: Path) -> str:
        persist_dir = settings.INDEX_DIR / file_hash
        if persist_dir.exists(): return str(persist_dir)
        try:
            reader = SimpleDirectoryReader(input_files=[str(file_path)])
            documents = reader.load_data()
            if not documents or all(not doc.text.strip() for doc in documents):
                if file_path.exists(): file_path.unlink()
                raise EmptyContentError()
            index = VectorStoreIndex.from_documents(documents)
            persist_dir.mkdir(parents=True, exist_ok=True)
            index.storage_context.persist(persist_dir=persist_dir)
            return str(persist_dir)
        except Exception as e:
            raise IndexingFailed(detail=str(e))

    def get_index(self, file_hash: str):
        persist_dir = settings.INDEX_DIR / file_hash
        if not persist_dir.exists(): return None
        storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
        return load_index_from_storage(storage_context)

ingestion_service = IngestionService()