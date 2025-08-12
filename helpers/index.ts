import crypto from "crypto";
import { pageIcons } from "@/constants/page";
import { Question } from "@/interface";

// Get the icon and color for a specific page
export function getPageIconAndPath(pathname: string): {
  icon: string;
  color: string;
} {
  return pageIcons[pathname];
}

// Get reset password token
export const getResetPasswordToken = () => {
  // Generate a random reset token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the reset token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration for the reset token
  const resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  // Return the reset token, hashed token, and expiration
  return {
    resetToken,
    resetPasswordToken,
    resetPasswordExpire,
  };
};

// Get the index of the first incomplete question
export function getFirstIncompleteQuestionIndex(questions: Question[]): number {
  // Find the index of the first incomplete question
  const firstIncompleteIndex = questions.findIndex(
    (question) => !question.completed
  );

  // If all questions are complete, return 0
  return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
}

// Format time in mm:ss
export function formatTime(seconds: number | undefined): string {
  if (seconds === undefined) return "00:00";

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  // Get remaining seconds
  const remainingSeconds = seconds % 60;

  // Format the time string
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// Save answer to local storage
export const saveAnswerToLocalStorage = (
  interviewId: string,
  questionId: string,
  answer: string
) => {
  // Construct the key and store the answer in local storage
  const key = `interview-${interviewId}-answers`;

  // Get the existing answers from local storage
  const storedAnswers = JSON.parse(localStorage.getItem(key) || "{}");

  // Update the answer for the specific question
  storedAnswers[questionId] = answer;

  // Save the updated answers back to local storage
  localStorage.setItem(key, JSON.stringify(storedAnswers));
};

// Get answer from local storage
export const getAnswerFromLocalStorage = (
  interviewId: string,
  questionId: string
) => {
  // Construct the key and retrieve the answers from local storage
  const key = `interview-${interviewId}-answers`;

  // Get the existing answers from local storage
  const storedAnswers = JSON.parse(localStorage.getItem(key) || "{}");

  // Return the answer for the specific question
  return storedAnswers[questionId] || "";
};

export const getAnswersFromLocalStorage = (interviewId: string) => {
  // Construct the key and retrieve the answers from local storage
  const key = `interview-${interviewId}-answers`;

  // Get the existing answers from local storage
  const storedAnswers = localStorage.getItem(key);

  // Return the answer for the specific question
  return storedAnswers ? JSON.parse(storedAnswers) : null;
};

export const calculateAverageScore = (questions: Question[]) => {
  if (!questions || questions.length === 0) return 0;

  const totalScore = questions.reduce((acc, question) => {
    return acc + (question.result?.overallScore || 0);
  }, 0);

  return (totalScore / questions.length).toFixed(1);
};

export const calculateDuration = (duration: number, durationLeft: number) => {
  const durationUsedMinutes = ((duration - durationLeft) / 60).toFixed(0);
  const totalDurationInMinutes = (duration / 60).toFixed(0);

  return {
    strValue: `${durationUsedMinutes} / ${totalDurationInMinutes} min`,
    total: parseInt(totalDurationInMinutes),
    chartDataValue: parseFloat(durationUsedMinutes),
  };
};

// Get the total number of pages
export const getTotalPages = (
  totalQuestions: number,
  questionsPerPage: number
) => {
  // Calculate the total number of pages
  return Math.ceil(totalQuestions / questionsPerPage);
};

// Paginate the data array
export const paginate = <T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  // Paginate the data array
  const startIndex = (currentPage - 1) * itemsPerPage;
  // Calculate the end index
  const endIndex = startIndex + itemsPerPage;
  // Return the paginated data
  return data.slice(startIndex, endIndex);
};

export const updateSearchParams = (
  queryParams: URLSearchParams,
  key: string,
  value: string
) => {
  if (queryParams.has(key)) {
    queryParams.set(key, value);
  } else {
    queryParams.append(key, value);
  }
  return queryParams;
};
