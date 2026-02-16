import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Calendar, Award, ChevronRight, Loader2, Target, BarChart3 } from 'lucide-react';
import { getHistory, getHistoryDetail } from '../services/api';

const HistoryDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const data = await getHistory();
      setHistory(data.attempts);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempt = async (sessionId) => {
    try {
      const results = await getHistoryDetail(sessionId);
      navigate('/result', { state: { results } });
    } catch (err) {
      alert("Could not retrieve session details.");
    }
  };

  if (loading) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Retrieving Analytics</p>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <History className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Assessments</h2>
            <p className="text-slate-400 text-xs font-medium">Your historical performance and domain mastery</p>
          </div>
        </div>
        <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter">
          {history.length} Saved Records
        </div>
      </div>

      <div className="grid gap-6">
        {history.map((item) => (
          <div 
            key={item.session_id} 
            onClick={() => handleViewAttempt(item.session_id)}
            className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden active:scale-[0.99]"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              item.accuracy >= 70 ? 'bg-green-500' : item.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-black text-xl text-slate-800 group-hover:text-blue-600 transition-colors tracking-tight">
                    {item.test_name}
                  </h3>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                    item.status === 'COMPLETED' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Target size={14} />
                    <span className="text-xs font-black uppercase tracking-tight">
                      {item.accuracy.toFixed(1)}% Accuracy
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BarChart3 size={14} />
                    <span className="text-xs font-bold uppercase tracking-tight">
                        {item.max_score} Questions
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-10 border-t lg:border-t-0 pt-6 lg:pt-0">
                <div className="flex gap-3">
                  {Object.entries(item.difficulty_stats || {}).map(([level, stats]) => (
                    <div key={level} className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                      <div className="text-[8px] uppercase font-black text-slate-400 mb-1">{level}</div>
                      <div className="text-sm font-black text-slate-700">
                        {stats.score}<span className="text-slate-300 mx-0.5">/</span>{stats.total}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6 border-l border-slate-100 pl-8">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-2">Final Score</div>
                    <div className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                      {item.total_score}<span className="text-slate-300 text-lg">/{item.max_score}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500">
                    <ChevronRight size={24} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-4 py-10">
          <div className="h-px w-20 bg-slate-200"></div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Archive</p>
      </div>
    </div>
  );
};

export default HistoryDashboard;