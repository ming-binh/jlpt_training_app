import api from './api';

export interface ExamQuestion {
  id: number;
  sectionId: number;
  questionNumber: number;
  questionText: string;
  underlinedText?: string | null;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  scoreWeight: number;
  orderIndex: number;
  correctOption?: number;
  explanation?: string;
  userSelectedOption?: number | null;
  isCorrect?: boolean;
}

export interface ExamSection {
  id: number;
  examId: number;
  sectionType: 'VOCABULARY' | 'GRAMMAR' | 'READING' | 'LISTENING';
  mondaiNumber: number;
  title: string;
  instruction?: string;
  passageText?: string | null;
  audioUrl?: string | null;
  timeLimitMinutes: number;
  orderIndex: number;
  questionCount: number;
  userBestScore?: number | null;
  userMaxScore?: number | null;
  userPassed?: boolean | null;
  questions?: ExamQuestion[];
}

export interface ExamItem {
  id: number;
  code: string;
  title: string;
  jlptLevel: string;
  year?: number;
  month?: number;
  totalTimeMinutes: number;
  totalQuestions: number;
  description?: string;
  isPublished: boolean;
  userBestScore?: number | null;
  userMaxScore?: number | null;
  userPassed?: boolean | null;
  userAttemptCount?: number;
  lastAttemptDate?: string | null;
  sections?: ExamSection[];
}

export interface ExamSubmitRequest {
  sectionId?: number;
  answers: Record<number, number>;
  timeSpentSeconds: number;
}

export interface ExamSubmitResponse {
  attemptId: number;
  examId: number;
  examTitle: string;
  jlptLevel: string;
  sectionId?: number | null;
  sectionTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  xpEarned: number;
  submittedAt: string;
  reviewQuestions: ExamQuestion[];
}

export interface ExamAttemptReview {
  attemptId: number;
  examId: number;
  examCode: string;
  examTitle: string;
  jlptLevel: string;
  year?: number;
  month?: number;
  sectionId?: number | null;
  sectionTitle: string;
  mondaiNumber?: number | null;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  xpEarned: number;
  submittedAt: string;
  questions?: ExamQuestion[];
}

export const examService = {
  getExams: async (level?: string): Promise<ExamItem[]> => {
    const params: Record<string, any> = {};
    if (level && level.toLowerCase() !== 'all') {
      params.level = level.toUpperCase();
    }
    const response = await api.get<ExamItem[]>('/exams', { params });
    return response.data;
  },

  getExamDetail: async (id: number): Promise<ExamItem> => {
    const response = await api.get<ExamItem>(`/exams/${id}`);
    return response.data;
  },

  getSectionQuestions: async (examId: number, sectionId: number): Promise<ExamSection> => {
    const response = await api.get<ExamSection>(`/exams/${examId}/sections/${sectionId}`);
    return response.data;
  },

  getFullExamQuestions: async (examId: number): Promise<ExamItem> => {
    const response = await api.get<ExamItem>(`/exams/${examId}/full`);
    return response.data;
  },

  submitExam: async (examId: number, data: ExamSubmitRequest): Promise<ExamSubmitResponse> => {
    const response = await api.post<ExamSubmitResponse>(`/exams/${examId}/submit`, data);
    return response.data;
  },

  getAttemptReview: async (attemptId: number): Promise<ExamAttemptReview> => {
    const response = await api.get<ExamAttemptReview>(`/exams/attempts/${attemptId}`);
    return response.data;
  },

  getUserHistory: async (): Promise<ExamAttemptReview[]> => {
    const response = await api.get<ExamAttemptReview[]>('/exams/my-history');
    return response.data;
  },
};
