import { pageIcons } from "@/constants/page";
import { Question } from "@/interface";

// Get the icon and color for a specific page
export function getPageIconAndPath(pathname: string): {
  icon: string;
  color: string;
} {
  return pageIcons[pathname];
}

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
