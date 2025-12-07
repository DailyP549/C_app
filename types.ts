export interface StructuredAnswer {
  oneLine: string;
  twoLines: string;
  fiveLines: string;
  diagramDescription: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  READING_PDF = 'READING_PDF',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string | StructuredAnswer;
}

export interface HistoryItem {
  id: string;
  question: string;
  answer: StructuredAnswer;
  timestamp: number;
}