import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas import dtos
from app.core.config import settings
from app.services.ingestion import ingestion_service
from app.services.generator import generator_service
from app.services.report import report_service
from app.core.exceptions import ConfigurationError, SessionExpiredError

router = APIRouter()

@router.post("/upload", response_model=dtos.FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    file_hash, file_path = ingestion_service.validate_and_save(file.filename, content)
    ingestion_service.create_index(file_hash, file_path)
    return dtos.FileUploadResponse(file_hash=file_hash, filename=file.filename, message="Success")

@router.post("/generate", response_model=dtos.SessionResponse)
def generate_quiz(config: dtos.QuizConfig, db: Session = Depends(get_db)):
    index = ingestion_service.get_index(config.file_hash)
    if not index: raise ConfigurationError("Index not found.")

    file_ext = ""
    for ext in [".pdf", ".docx", ".pptx", ".txt"]:
        if (settings.UPLOAD_DIR / f"{config.file_hash}{ext}").exists():
            file_ext = ext
            break
    
    file_path = settings.UPLOAD_DIR / f"{config.file_hash}{file_ext}"
    test_name = ingestion_service.generate_title(file_path)
    raw_questions = generator_service.generate_quiz(index, config)
    
    session_id = str(uuid.uuid4())
    db_session = models.QuizSession(
        id=session_id, file_hash=config.file_hash, test_name=test_name,
        config=config.dict(), status="ACTIVE"
    )
    db.add(db_session)
    
    ui_questions = []
    for q_data in raw_questions:
        # CRITICAL FIX: Ensure reference_context is always a string
        ref = q_data.get('reference_context', "")
        if isinstance(ref, dict):
            ref = str(ref)

        q_obj = models.Question(
            session_id=session_id,
            question_text=q_data['question_text'],
            options=q_data['options'],
            correct_answer=q_data['correct_answer'],
            difficulty=q_data['difficulty'],
            explanation=q_data['explanation'],
            reference_context=ref 
        )
        db.add(q_obj)
        db.flush() 
        
        ui_questions.append(dtos.QuestionBase(
            id=q_obj.id, question_text=q_obj.question_text,
            options=q_obj.options, difficulty=q_obj.difficulty
        ))
    
    db.commit()
    return dtos.SessionResponse(session_id=session_id, test_name=test_name, questions=ui_questions)

@router.get("/history", response_model=dtos.HistoryResponse)
def get_history(db: Session = Depends(get_db)):
    sessions = db.query(models.QuizSession).order_by(models.QuizSession.created_at.desc()).all()
    history_items = [
        dtos.HistoryItem(
            session_id=s.id, test_name=s.test_name or "Assessment",
            accuracy=s.accuracy, total_score=s.total_score, max_score=s.max_score,
            created_at=s.created_at, difficulty_stats=s.difficulty_stats or {}, status=s.status
        ) for s in sessions if s.status != "ACTIVE"
    ]
    return dtos.HistoryResponse(attempts=history_items)

@router.get("/history/{session_id}", response_model=dtos.ResultResponse)
def get_session_detail(session_id: str, db: Session = Depends(get_db)):
    session = db.query(models.QuizSession).filter(models.QuizSession.id == session_id).first()
    if not session: raise SessionExpiredError("Not found.")
    return dtos.ResultResponse(
        session_id=session.id, test_name=session.test_name or "Assessment",
        total_score=session.total_score, max_score=session.max_score,
        accuracy=session.accuracy, difficulty_breakdown=session.difficulty_stats or {},
        report_url=f"/api/report/download/{session.id}"
    )

@router.post("/proctor/log")
def log_violation(payload: dtos.ProctorIncident, db: Session = Depends(get_db)):
    session = db.query(models.QuizSession).filter(models.QuizSession.id == payload.session_id).first()
    if not session or session.status != "ACTIVE": raise SessionExpiredError()
    log = models.ProctorLog(session_id=payload.session_id, violation_type=payload.violation_type)
    db.add(log)
    count = db.query(models.ProctorLog).filter(models.ProctorLog.session_id == payload.session_id).count()
    if count >= 3: session.status = "AUTO_SUBMITTED"
    db.commit()
    return {"status": "logged", "violation_count": count}

@router.post("/submit", response_model=dtos.ResultResponse)
def submit_quiz(payload: dtos.QuizSubmission, db: Session = Depends(get_db)):
    session = db.query(models.QuizSession).filter(models.QuizSession.id == payload.session_id).first()
    if not session: raise SessionExpiredError()
    questions = {q.id: q for q in session.questions}
    total_correct = 0
    max_score = len(session.questions)
    diff_stats = {"easy": {"score": 0, "total": 0}, "medium": {"score": 0, "total": 0}, "hard": {"score": 0, "total": 0}}
    for ans in payload.answers:
        q = questions.get(ans.question_id)
        if not q: continue
        is_correct = (ans.selected_answer == q.correct_answer)
        if is_correct: total_correct += 1
        diff_stats[q.difficulty]["total"] += 1
        if is_correct: diff_stats[q.difficulty]["score"] += 1
        db.add(models.StudentResponse(session_id=session.id, question_id=q.id, selected_answer=ans.selected_answer, is_correct=is_correct))
    session.accuracy = (total_correct / max_score * 100) if max_score > 0 else 0
    session.total_score, session.max_score = float(total_correct), float(max_score)
    session.status = "COMPLETED" if session.status == "ACTIVE" else session.status
    session.completed_at, session.difficulty_stats = models.datetime.utcnow(), {k: v for k, v in diff_stats.items() if v["total"] > 0}
    db.commit()
    report_path = report_service.generate_quiz_report(
        {"id": session.id, "test_name": session.test_name, "total_score": session.total_score, "max_score": session.max_score, "accuracy": session.accuracy, "status": session.status},
        session.questions, session.responses, session.proctor_logs
    )
    session.pdf_report_path = report_path
    db.commit()
    return dtos.ResultResponse(session_id=session.id, test_name=session.test_name, total_score=session.total_score, max_score=session.max_score, accuracy=session.accuracy, difficulty_breakdown=session.difficulty_stats, report_url=f"/api/report/download/{session.id}")

@router.get("/report/download/{session_id}")
def download_report(session_id: str, db: Session = Depends(get_db)):
    from fastapi.responses import FileResponse
    session = db.query(models.QuizSession).filter(models.QuizSession.id == session_id).first()
    if not session or not session.pdf_report_path: raise SessionExpiredError("No report.")
    return FileResponse(session.pdf_report_path, filename=f"Report_{session_id}.pdf")