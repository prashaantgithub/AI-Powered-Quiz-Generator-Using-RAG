import React from 'react';
import { AlertTriangle, ShieldAlert, XOctagon, X } from 'lucide-react';

const ProctorAlert = ({ warningCount, onClose }) => {
  if (warningCount === 0) return null;

  const config = {
    1: {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "First Warning: Violation Detected",
      message: "Please stay on this page in full-screen mode. Switching tabs or exiting full-screen is recorded.",
      color: "bg-yellow-600"
    },
    2: {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Final Warning: Integrity Violation",
      message: "One more violation will result in immediate automatic submission of your quiz.",
      color: "bg-orange-600"
    },
    3: {
      icon: <XOctagon className="w-6 h-6" />,
      title: "Automatic Submission Triggered",
      message: "Multiple violations detected. Your session has been locked and submitted.",
      color: "bg-red-600"
    }
  };

  const current = config[warningCount] || config[3];

  return (
    <div className={`proctor-warning ${current.color} shadow-2xl max-w-md w-full border border-white/20 p-4 rounded-lg flex flex-col`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-4">
          <div className="bg-white/20 p-2 rounded-lg h-fit">
            {current.icon}
          </div>
          <div>
            <h4 className="font-bold text-lg">{current.title}</h4>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="hover:bg-white/10 p-1 rounded-full transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>
      <p className="text-sm text-white/90 leading-relaxed pl-12">
        {current.message}
      </p>
      {warningCount < 3 && (
        <div className="mt-4 ml-12 bg-black/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-500" 
            style={{ width: `${(warningCount / 3) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProctorAlert;