import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ShieldCheck, FileType, Zap } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import QuizConfig from '../components/QuizConfig';
import HistoryDashboard from '../components/HistoryDashboard';

const Home = () => {
  const [step, setStep] = useState('upload');
  const [fileData, setFileData] = useState({ hash: '', name: '' });
  const navigate = useNavigate();

  const handleUploadSuccess = (hash, name) => {
    setFileData({ hash, name });
    setTimeout(() => setStep('config'), 1500);
  };

  const handleQuizGenerated = (data) => {
    navigate('/quiz', { state: { quizData: data } });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Adaptive<span className="text-blue-600">Quiz</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-1">
              <ShieldCheck size={16} className="text-green-500" />
              Proctor Enabled
            </div>
            <div className="flex items-center gap-1">
              <Zap size={16} className="text-yellow-500" />
              AI Generated
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Turn your documents into <br />
            <span className="text-blue-600">Adaptive Assessments</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your study material and let our offline AI generate custom 
            difficulty-aware quizzes with full proctoring mode.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center w-full max-w-md">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
                step === 'upload' ? 'border-blue-600 bg-blue-600 text-white' : 'border-green-500 bg-green-500 text-white'
              }`}>
                1
              </div>
              <span className="text-xs font-bold uppercase mt-2 text-slate-500">Upload</span>
            </div>
            <div className={`h-1 flex-1 -mt-6 border-t-2 border-dashed ${
              step === 'config' ? 'border-blue-600' : 'border-slate-200'
            }`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
                step === 'config' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-400'
              }`}>
                2
              </div>
              <span className="text-xs font-bold uppercase mt-2 text-slate-500">Configure</span>
            </div>
          </div>
        </div>

        {step === 'upload' ? (
          <>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <HistoryDashboard />
          </>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className="mb-4 flex items-center gap-2 text-slate-600 bg-white p-3 rounded-lg border w-fit">
              <FileType size={18} className="text-blue-600" />
              <span className="text-sm font-medium">Active File: </span>
              <span className="text-sm font-bold text-slate-900">{fileData.name}</span>
            </div>
            <QuizConfig 
              fileHash={fileData.hash} 
              onQuizGenerated={handleQuizGenerated} 
            />
            <button 
              onClick={() => setStep('upload')}
              className="mt-6 text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors flex items-center gap-1"
            >
              Cancel and upload another file
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-4 text-blue-600">
                <ShieldCheck />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Proctor Mode</h3>
              <p className="text-sm text-slate-500">Real-time monitoring of tab switches and window activity.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-4 text-blue-600">
                <Zap />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Difficulty Buckets</h3>
              <p className="text-sm text-slate-500">Questions segmented into Easy, Medium, and Hard levels.</p>
            </div>
            <div className="text-center">
              <div className="bg-white w-12 h-12 rounded-xl shadow-sm border flex items-center justify-center mx-auto mb-4 text-blue-600">
                <FileType />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Smart Indexing</h3>
              <p className="text-sm text-slate-500">Advanced RAG ensures questions never leave your content scope.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;