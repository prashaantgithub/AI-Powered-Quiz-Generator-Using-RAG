import React from 'react';

const QuestionCard = ({ 
  question, 
  currentIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  onNext, 
  onPrev 
}) => {
  if (!question) return null;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="card w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className={`text-xs font-bold px-2 py-1 rounded border self-start uppercase ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-medium text-slate-800 mb-8 leading-relaxed unselectable">
        {question.question_text}
      </h3>

      <div className="space-y-3 mb-8">
        {Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onAnswerSelect(question.id, key)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${
              selectedAnswer === key
                ? 'border-blue-600 bg-blue-50 shadow-sm'
                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
              selectedAnswer === key 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}>
              {key}
            </span>
            <span className={`text-lg unselectable ${
              selectedAnswer === key ? 'text-blue-900 font-medium' : 'text-slate-700'
            }`}>
              {value}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center border-t pt-6">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={onNext}
          className="btn-primary px-8"
        >
          {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;