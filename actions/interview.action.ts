"use server";

import { auth } from "@/auth";
import { InterviewBody } from "@/interface";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const mockQuestions = (numOfQuestions: number) => {
  const questions = [];
  for (let i = 0; i < numOfQuestions; i++) {
    questions.push({
      question: `Mock Question ${i + 1}`,
      answers: `Mock answer ${i + 1}`,
    });
  }
  return questions;
};

export const createInterview = async (body: InterviewBody) => {
  const { industry, type, topic, role, numOfQuestions, difficulty, duration } =
    body;

  const session = await auth();

  if (!session || !session.user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  const questions = mockQuestions(numOfQuestions);

  try {
    // สร้าง Interview พร้อม Question (แต่ยังไม่สร้าง Result)
    const newInterview = await prisma.interview.create({
      data: {
        industry,
        topic,
        role,
        numOfQuestions,
        difficulty,
        duration: duration * 60,
        durationLeft: duration * 60,
        userId: session.user.id,
        type,
        Question: {
          create: questions.map((q) => ({
            question: q.question,
            answer: q.answers,
          })),
        },
      },
      include: {
        Question: true, // ดึง Question ที่สร้างมา
      },
    });

    // สร้าง Result สำหรับแต่ละ Question
    if (newInterview?.Question?.length) {
      await Promise.all(
        newInterview.Question.map((q) =>
          prisma.result.create({
            data: {
              questionId: q.id,
              overallScore: 0,
              clarity: 0,
              completeness: 0,
              relevance: 0,
              suggestion: "",
            },
          })
        )
      );
    }

    return {
      success: true,
      message: "Interview created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create interview",
    };
  }
};

export const getInterviews = async () => {
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const interviews = await prisma.interview.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      Question: {
        include: {
          result: true, // include Result ที่ join กับแต่ละ Question
        },
      },
    },
  });

  return interviews;
};

export const deleteUserInterview = async (interviewId: string) => {
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.interview.delete({
      where: {
        id: interviewId,
      },
    });

    revalidatePath("/app/interviews");

    return {
      success: true,
      message: "Interview deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete interview",
    };
  }
};
