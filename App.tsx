import React, { useState, useRef, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnswerDisplay } from './components/AnswerDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { generateAnswer } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { StructuredAnswer, LoadingState, HistoryItem } from './types';

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<StructuredAnswer | null>(null);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Cache the base64 string to avoid re-reading the file on every request
  const pdfBase64Ref = useRef<string | null>(null);

  // Load history when PDF changes
  useEffect(() => {
    if (pdfFile) {
      const key = `ncert_tutor_history_${pdfFile.name}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setHistory(JSON.parse(saved));
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error("Failed to load history", e);
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [pdfFile]);

  const handleFileSelect = async (file: File) => {
    setLoading(LoadingState.READING_PDF);
    setPdfFile(file);
    setAnswer(null);
    setErrorMsg(null);
    setQuestion("");
    
    try {
      const base64 = await fileToBase64(file);
      pdfBase64Ref.current = base64;
      setLoading(LoadingState.IDLE);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to read the PDF file.");
      setLoading(LoadingState.ERROR);
    }
  };

  const saveToHistory = (q: string, a: StructuredAnswer) => {
    if (!pdfFile) return;
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question: q,
      answer: a,
      timestamp: Date.now()
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem(
        `ncert_tutor_history_${pdfFile.name}`, 
        JSON.stringify(updatedHistory)
      );
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    if (!pdfBase64Ref.current) {
      setErrorMsg("Please upload a PDF first.");
      return;
    }

    setLoading(LoadingState.GENERATING);
    setAnswer(null);
    setErrorMsg(null);

    try {
      const response = await generateAnswer(pdfBase64Ref.current, question);
      setAnswer(response);
      saveToHistory(question, response);
      setLoading(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to generate answer. Please try again.");
      setLoading(LoadingState.ERROR);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setQuestion(item.question);
    setAnswer(item.answer);
    setErrorMsg(null);
    setLoading(LoadingState.SUCCESS);
    setIsHistoryOpen(false);
    
    // Scroll to top of answer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h1 className="text-xl font-bold text-slate-800">NCERT AI Tutor</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              Offline Source Mode
            </div>
            {pdfFile && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                title="View History"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {history.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelect={handleSelectHistory}
        fileName={pdfFile ? pdfFile.name : null}
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Intro */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Study Smart</h2>
          <p className="text-slate-600">Upload your 6th Standard textbook PDF and ask any question.</p>
        </div>

        {/* Upload Section */}
        <FileUpload 
          onFileSelect={handleFileSelect} 
          selectedFileName={pdfFile ? pdfFile.name : null} 
        />

        {/* File Status Indicator */}
        <div className="mb-8 text-center min-h-[1.5rem]">
          {loading === LoadingState.READING_PDF ? (
            <p className="text-sm font-medium text-indigo-600 animate-pulse flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Reading PDF...
            </p>
          ) : pdfFile && !errorMsg ? (
            <p className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-2 animate-fade-in">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              PDF processed successfully
            </p>
          ) : null}
        </div>

        {/* Question Section - Only show if file is loaded */}
        {pdfFile && loading !== LoadingState.READING_PDF && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-500 ease-in-out">
            <label htmlFor="question" className="block text-sm font-semibold text-slate-700 mb-2">
              Ask a question from the chapter
            </label>
            <div className="flex gap-2">
              <input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is photosynthesis?"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <button
                onClick={handleAskQuestion}
                disabled={loading === LoadingState.GENERATING || !question.trim()}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
              >
                {loading === LoadingState.GENERATING ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  'Ask'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Results */}
        {answer && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Answer Analysis</h2>
              <button 
                onClick={() => setAnswer(null)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
            <AnswerDisplay answer={answer} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;