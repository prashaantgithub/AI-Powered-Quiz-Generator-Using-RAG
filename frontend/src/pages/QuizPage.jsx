import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Maximize, Send, ShieldAlert } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';
import ProctorAlert from '../components/ProctorAlert';
import { logProctorViolation, submitQuiz } from '../services/api';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizData } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [warningCount, setWarningCount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  const questions = quizData?.questions || [];
  const sessionId = quizData?.session_id;
  const isAllAnswered = Object.keys(userAnswers).length === questions.length;

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const answersArray = Object.entries(userAnswers).map(([qId, ans]) => ({
      question_id: parseInt(qId),
      selected_answer: ans
    }));
    try {
      const results = await submitQuiz(sessionId, answersArray);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      navigate('/result', { state: { results } });
    } catch (err) { 
      console.error(err); 
      setIsSubmitting(false);
    }
  }, [sessionId, userAnswers, navigate, isSubmitting]);

  const handleViolation = useCallback(async (type) => {
    if (warningCount >= 3 || isSubmitting || !examStarted) return;
    try {
      const response = await logProctorViolation(sessionId, type);
      setWarningCount(response.violation_count);
      setShowAlert(true);
      if (response.violation_count >= 3) handleAutoSubmit();
    } catch (err) { console.error(err); }
  }, [sessionId, warningCount, handleAutoSubmit, isSubmitting, examStarted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
    setExamStarted(true);
  };

  useEffect(() => {
    if (!quizData) { navigate('/'); return; }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && examStarted) handleViolation("TAB_SWITCH");
    };
    const handleBlur = () => {
      if (examStarted && !isSubmitting) handleViolation("WINDOW_FOCUS_LOSS");
    };
    const handleFSChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && examStarted && !isSubmitting) handleViolation("EXIT_FULLSCREEN");
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFSChange);

    const timer = setInterval(() => {
      if (examStarted && !isSubmitting) {
        setTimeLeft(p => {
          if (p <= 1) { clearInterval(timer); handleAutoSubmit(); return 0; }
          return p - 1;
        });
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFSChange);
      clearInterval(timer);
    };
  }, [quizData, navigate, handleViolation, handleAutoSubmit, isSubmitting, examStarted]);

  if (!quizData) return null;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-10 rounded-3xl text-center shadow-2xl">
          <ShieldCheck size={64} className="text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-8">Security Activation</h2>
          <button onClick={toggleFullscreen} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl">
            Begin Secure Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 unselectable">
      {showAlert && <ProctorAlert warningCount={warningCount} onClose={() => setShowAlert(false)} />}
      
      {!isFullscreen && (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert size={64} className="text-red-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-4">Integrity Violation</h2>
          <button onClick={toggleFullscreen} className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold">Resume Fullscreen</button>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-10 h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <span className="bg-red-500 text-white px-2 py-1 rounded font-black text-[10px] uppercase tracking-widest">Active Proctoring</span>
          <div className="font-mono font-bold text-slate-700 text-xl">
            {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
          </div>
        </div>
        <button
          onClick={handleAutoSubmit}
          disabled={!isAllAnswered || isSubmitting}
          className={`px-8 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${isAllAnswered ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
        >
          Submit Quiz
        </button>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-4 flex gap-8">
        <div className="flex-1">
          <QuestionCard
            question={questions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={userAnswers[questions[currentIndex]?.id]}
            onAnswerSelect={(id, ans) => setUserAnswers(p => ({...p, [id]: ans}))}
            onNext={() => currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1)}
            onPrev={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          />
        </div>
        <aside className="w-48 hidden lg:block">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-widest border-b pb-2">Matrix</h3>
            <div className="grid grid-cols-3 gap-2">
              {questions.map((_, i) => (
                <div key={i} onClick={() => setCurrentIndex(i)} className={`h-10 flex items-center justify-center rounded-lg cursor-pointer font-bold border-2 ${currentIndex === i ? 'border-blue-600 bg-blue-50 text-blue-600' : userAnswers[questions[i].id] ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 text-slate-300'}`}>
                  {i+1}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default QuizPage;