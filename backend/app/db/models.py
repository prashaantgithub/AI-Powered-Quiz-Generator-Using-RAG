from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    file_hash = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    index_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(String, primary_key=True, index=True)
    file_hash = Column(String, ForeignKey("uploaded_files.file_hash"))
    test_name = Column(String, nullable=True)
    config = Column(JSON, nullable=False)
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    accuracy = Column(Float, default=0.0)
    difficulty_stats = Column(JSON, nullable=True)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    pdf_report_path = Column(String, nullable=True)

    questions = relationship("Question", back_populates="session", cascade="all, delete-orphan")
    responses = relationship("StudentResponse", back_populates="session", cascade="all, delete-orphan")
    proctor_logs = relationship("ProctorLog", back_populates="session", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("quiz_sessions.id"))
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    reference_context = Column(Text, nullable=True)

    session = relationship("QuizSession", back_populates="questions")
    response = relationship("StudentResponse", uselist=False, back_populates="question")

class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("quiz_sessions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_answer = Column(String, nullable=True)
    is_correct = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("QuizSession", back_populates="responses")
    question = relationship("Question", back_populates="response")

class ProctorLog(Base):
    __tablename__ = "proctor_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("quiz_sessions.id"))
    violation_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("QuizSession", back_populates="proctor_logs")