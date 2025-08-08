"use server";

import { InterviewBody } from "@/interface";

export const createInterview = async (body: InterviewBody) => {
  const {
    industry,
    type,
    topic,
    role,
    numOfQuestions,
    difficulty,
    duration,
    userId,
  } = body;
};
