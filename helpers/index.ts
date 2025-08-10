import { pageIcons } from "@/constants/page";
import { Question } from "@/interface";

export function getPageIconAndPath(pathname: string): {
  icon: string;
  color: string;
} {
  return pageIcons[pathname];
}

export function getFirstIncompleteQuestionIndex(questions: Question[]): number {
  const firstIncompleteIndex = questions.findIndex(
    (question) => !question.completed
  );

  return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
}
