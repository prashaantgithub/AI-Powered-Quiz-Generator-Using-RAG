import React from 'react';
import { 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  Title, 
  Tooltip, 
  ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Download, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Award, 
  FileText, 
  Table as TableIcon 
} from 'lucide-react';
import { getReportDownloadUrl } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResultsDashboard = ({ results }) => {
  const { 
    test_name, 
    total_score, 
    max_score, 
    accuracy, 
    difficulty_breakdown, 
    session_id 
  } = results;

  const barData = {
    labels: Object.keys(difficulty_breakdown).map(k => k.toUpperCase()),
    datasets: [
      {
        label: 'Correct',
        data: Object.values(difficulty_breakdown).map(v => v.score),
        backgroundColor: '#2563eb',
        borderRadius: 4,
      },
      {
        label: 'Total',
        data: Object.values(difficulty_breakdown).map(v => v.total),
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
      }
    ],
  };

  const pieData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [total_score, max_score - total_score],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const handleDownload = () => {
    window.open(`http://localhost:8000${getReportDownloadUrl(session_id)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-[10px] tracking-[0.2em]">
              <FileText size={14} />
              Report Generated
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              {test_name || "Assessment Result"}
            </h2>
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">SID: {session_id.split('-')[0]}</span>
               <span className="text-xs font-bold text-slate-400">|</span>
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{max_score} Total Questions</span>
            </div>
          </div>

          <div className="flex items-center gap-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="text-center">
              <div className="text-4xl font-black text-blue-600">{accuracy.toFixed(0)}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mastery</div>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-800">{total_score}/{max_score}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Points</div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
          >
            <Download size={18} />
            Export Results to PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6 font-bold text-slate-800">
            <BarChart3 size={18} className="text-blue-600" />
            Performance by Difficulty
          </div>
          <div className="h-64">
            <Bar 
              data={barData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6 font-bold text-slate-800">
            <PieChartIcon size={18} className="text-blue-600" />
            Score Accuracy
          </div>
          <div className="h-64">
            <Pie 
              data={pieData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10, weight: 'bold' } } } }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800">
          <TableIcon size={18} className="text-blue-600" />
          Scorecard Summary
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black bg-slate-50/50">
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Attempted</th>
                <th className="px-6 py-4">Correct</th>
                <th className="px-6 py-4">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.entries(difficulty_breakdown).map(([level, stats]) => (
                <tr key={level} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold capitalize text-slate-700">{level}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{stats.total}</td>
                  <td className="px-6 py-4 text-green-600 font-bold">{stats.score}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${(stats.score / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">
                            {((stats.score / stats.total) * 100).toFixed(0)}%
                        </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;