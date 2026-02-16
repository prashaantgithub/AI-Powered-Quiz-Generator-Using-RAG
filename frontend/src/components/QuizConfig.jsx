import React, { useState } from 'react';
import { Settings, Sliders, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { generateQuiz } from '../services/api';

const QuizConfig = ({ fileHash, onQuizGenerated }) => {
  const [mode, setMode] = useState('mixed');
  const [counts, setCounts] = useState({ easy: 2, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalQuestions = mode === 'mixed' ? 30 : (counts.easy + counts.medium + counts.hard);

  const handleCountChange = (level, val) => {
    const value = Math.max(0, Math.min(10, parseInt(val) || 0));
    setCounts(prev => ({ ...prev, [level]: value }));
  };

  const validate = () => {
    if (mode === 'mixed') return true;
    
    if (totalQuestions > 30) {
      setError('Maximum 30 questions allowed.');
      return false;
    }
    if (counts.easy === 0 && counts.medium === 0 && counts.hard === 0) {
      setError('Please select at least one difficulty level.');
      return false;
    }
    return true;
  };

  const startQuiz = async () => {
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const config = {
        file_hash: fileHash,
        mode: mode,
        custom_distribution: mode === 'custom' ? counts : { easy: 10, medium: 10, hard: 10 }
      };
      const data = await generateQuiz(config);
      onQuizGenerated(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz. Content might be insufficient or AI timed out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-2xl mx-auto border border-slate-200">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Settings className="text-blue-600" />
        <h2 className="text-xl font-bold">Quiz Configuration</h2>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('mixed')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${
              mode === 'mixed' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold">Mixed Mode</span>
              {mode === 'mixed' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-sm text-slate-500">Fixed 30 questions (10 Easy, 10 Med, 10 Hard)</p>
          </button>

          <button
            onClick={() => setMode('custom')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${
              mode === 'custom' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold">Custom Mode</span>
              {mode === 'custom' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-sm text-slate-500">Select difficulty and count (Max 10 per level)</p>
          </button>
        </div>

        {mode === 'custom' && (
          <div className="bg-slate-50 p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
              <Sliders size={18} />
              <span>Define Question Distribution</span>
            </div>
            {['easy', 'medium', 'hard'].map((level) => (
              <div key={level} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                <span className="capitalize font-medium text-slate-600">{level}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={counts[level]}
                    onChange={(e) => handleCountChange(level, e.target.value)}
                    className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="w-8 text-center font-bold text-blue-600">{counts[level]}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-slate-600">
            Total Questions: <span className="font-bold text-slate-900">{totalQuestions}</span>
            <span className="text-xs ml-2 text-slate-400">(Max 30)</span>
          </div>
          
          <button
            onClick={startQuiz}
            disabled={loading}
            className="btn-primary min-w-[150px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Generating...
              </>
            ) : (
              'Start Quiz'
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizConfig;