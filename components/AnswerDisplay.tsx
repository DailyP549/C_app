import React, { useState, useEffect, useCallback } from 'react';
import { StructuredAnswer } from '../types';
import { generateDiagram } from '../services/geminiService';

interface AnswerDisplayProps {
  answer: StructuredAnswer;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer }) => {
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [isLoadingDiagram, setIsLoadingDiagram] = useState<boolean>(false);
  const [diagramError, setDiagramError] = useState<boolean>(false);

  const fetchDiagram = useCallback(async () => {
    if (!answer.diagramDescription) return;

    setIsLoadingDiagram(true);
    setDiagramError(false);
    setDiagramUrl(null);

    try {
      const base64Data = await generateDiagram(answer.diagramDescription);
      setDiagramUrl(`data:image/png;base64,${base64Data}`);
    } catch (error) {
      console.error("Failed to generate diagram:", error);
      setDiagramError(true);
    } finally {
      setIsLoadingDiagram(false);
    }
  }, [answer.diagramDescription]);

  useEffect(() => {
    fetchDiagram();
  }, [fetchDiagram]);

  return (
    <div className="w-full space-y-4 mt-6 animate-fade-in">
      {/* 1 Line Answer */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="bg-primary/10 p-1 rounded">⚡</span> Short Answer
        </h3>
        <p className="text-slate-800 font-medium">{answer.oneLine}</p>
      </div>

      {/* 2 Line Answer */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-secondary uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="bg-secondary/10 p-1 rounded">📝</span> Explanation
        </h3>
        <p className="text-slate-700">{answer.twoLines}</p>
      </div>

      {/* 5 Line Detail */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="bg-indigo-50 p-1 rounded">📚</span> Detailed Concept
        </h3>
        <p className="text-slate-600 leading-relaxed">{answer.fiveLines}</p>
      </div>

      {/* Diagram Description & Image */}
      <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-100 border-l-4 border-l-amber-400">
        <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-2">
          <span className="bg-amber-200/50 p-1 rounded">🖼️</span> Diagram
        </h3>
        <p className="text-amber-900 italic mb-4 text-sm">{answer.diagramDescription}</p>
        
        <div className="w-full flex justify-center">
          {isLoadingDiagram ? (
            <div className="h-64 w-full bg-white/50 border-2 border-dashed border-amber-300 rounded flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-amber-600 text-xs font-semibold">Generating AI Diagram...</span>
            </div>
          ) : diagramError ? (
            <div className="h-40 w-full bg-white/50 border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center gap-2 text-red-500">
              <span className="text-sm font-medium">Failed to generate diagram</span>
              <button 
                onClick={fetchDiagram}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors duration-200"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Generation
              </button>
            </div>
          ) : diagramUrl ? (
            <div className="relative group w-full flex justify-center">
              <img 
                src={diagramUrl} 
                alt="AI Generated Diagram" 
                className="rounded-lg shadow-md border border-amber-200 max-h-80 object-contain bg-white"
                onError={() => {
                  setDiagramUrl(null);
                  setDiagramError(true);
                }}
              />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                AI Generated
              </div>
            </div>
          ) : (
            <div className="h-32 w-full bg-white/50 border-2 border-dashed border-amber-300 rounded flex items-center justify-center text-amber-400 text-sm">
              [Diagram not available]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};