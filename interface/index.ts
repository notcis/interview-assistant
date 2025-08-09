export enum ProviderName {
  google = "google",
  github = "github",
  credentials = "credentials",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string | null;
  createdAt: Date;
  resetPasswordToken: string | null;
  resetPasswordExpire: Date | null;
}

export interface ProfilePicture {
  id: string;
  urlId: string | null;
  url: string | null;
  userId: string;
}

export interface AuthProvider {
  provider: ProviderName;
  providerId: string;
  userId: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  created: Date;
  status: string;
  startDate: Date;
  currentPeriodEnd: Date;
  nextPaymentAttempt: Date;
  userId: string;
}

export interface UserWithDetails extends User {
  ProfilePicture: { urlId: string | null; url: string | null };
  authProvider: { provider: ProviderName; providerId: string }[];
}

export interface InterviewBody {
  industry: string;
  type: string;
  topic: string;
  role: string;
  numOfQuestions: number;
  difficulty: string;
  duration: number;
}

export interface Interview {
  id: string;
  userId: string;
  industry: string;
  type: string;
  topic: string;
  role: string;
  numOfQuestions: number;
  answered: number;
  difficulty: string;
  duration: number;
  durationLeft: number;
  status: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  interviewId: string;
  question: string;
  answer: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result {
  id: string;
  questionId: string;
  overallScore: number;
  clarity: number;
  completeness: number;
  relevance: number;
  suggestion: string;
}

export interface ResultWithQuestionWithInterview extends Interview {
  Question: {
    id: string;
    interviewId: string;
    question: string;
    answer: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    result:
      | {
          id: string;
          questionId: string;
          overallScore: number;
          clarity: number;
          completeness: number;
          relevance: number;
          suggestion: string;
        }[]
      | null;
  }[];
}
