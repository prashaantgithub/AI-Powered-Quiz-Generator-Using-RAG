import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, RefreshCcw, FileText, CheckCircle2, LayoutDashboard } from 'lucide-react';
import ResultsDashboard from '../components/ResultsDashboard';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || {};

  useEffect(() => {
    if (!results) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [results, navigate]);

  if (!results) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Result<span className="text-blue-600">Analytics</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold text-sm transition-all"
            >
              <Home size={18} />
              Return Home
            </button>
            <button 
              onClick={() => navigate('/')}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"
            >
              <RefreshCcw size={16} />
              New Test
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-2xl">
              <CheckCircle2 className="text-green-600 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
              <p className="text-slate-500 font-medium">Detailed breakdown of your conceptual mastery.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200 px-2 py-1 rounded">
              Session Recorded
            </span>
          </div>
        </div>

        <ResultsDashboard results={results} />

        <div className="mt-16 p-10 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <RefreshCcw size={32} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3">Ready for the next challenge?</h3>
          <p className="text-slate-500 max-w-lg mx-auto mb-8 font-medium">
            Your results are now saved in your history. You can start a new quiz by uploading a different document or changing your configuration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
            >
              Start New Session
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;