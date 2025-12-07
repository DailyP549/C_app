import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  fileName: string | null;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  fileName
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-slate-800">History</h2>
            {fileName && (
              <p className="text-xs text-slate-500 truncate max-w-[180px]" title={fileName}>
                {fileName}
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            aria-label="Close history"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-70px)] p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 mt-10">
              <span className="text-4xl mb-3">🕰️</span>
              <p className="font-medium">No history yet</p>
              <p className="text-xs text-center mt-1 px-4">Questions you ask will appear here for this PDF.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="p-3 bg-white border border-slate-100 rounded-xl hover:border-primary/50 hover:shadow-md cursor-pointer transition-all group active:scale-98"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-primary leading-snug">
                    {item.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-secondary font-medium px-1">
                    Answered
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};