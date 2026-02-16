from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

# File Upload
class FileUploadResponse(BaseModel):
    file_hash: str
    filename: str
    message: str

# Quiz Configuration
class DifficultyCount(BaseModel):
    easy: int = 0
    medium: int = 0
    hard: int = 0

class QuizConfig(BaseModel):
    file_hash: str
    mode: str = "mixed"
    custom_distribution: Optional[DifficultyCount] = None

# Question Models
class QuestionBase(BaseModel):
    id: int
    question_text: str
    options: Dict[str, str]
    difficulty: str

class QuestionFull(QuestionBase):
    correct_answer: str
    explanation: str
    reference_context: str

# Session
class SessionResponse(BaseModel):
    session_id: str
    test_name: str
    questions: List[QuestionBase]

# Submission & Evaluation
class AnswerSubmission(BaseModel):
    question_id: int
    selected_answer: str

class QuizSubmission(BaseModel):
    session_id: str
    answers: List[AnswerSubmission]

class ProctorIncident(BaseModel):
    session_id: str
    violation_type: str

class ResultResponse(BaseModel):
    session_id: str
    test_name: str
    total_score: float
    max_score: float
    accuracy: float
    difficulty_breakdown: Dict[str, Dict[str, float]]
    report_url: str

# History Module DTOs
class HistoryItem(BaseModel):
    session_id: str
    test_name: str
    accuracy: float
    total_score: float
    max_score: float
    created_at: datetime
    difficulty_stats: Dict[str, Dict[str, float]]
    status: str

class HistoryResponse(BaseModel):
    attempts: List[HistoryItem]