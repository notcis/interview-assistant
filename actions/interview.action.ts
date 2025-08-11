"use server";

import { auth } from "@/auth";
import { InterviewBody } from "@/interface";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer, generateQuestions } from "@/openai/openai";
import { revalidatePath } from "next/cache";

// Create Interview
export const createInterview = async (body: InterviewBody) => {
  const { industry, type, topic, role, numOfQuestions, difficulty, duration } =
    body;

  // ตรวจสอบการเข้าสู่ระบบ
  const session = await auth();

  // ตรวจสอบการเข้าสู่ระบบ
  if (!session || !session.user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  // สร้างคำถามสำหรับสัมภาษณ์
  const questions = await generateQuestions(
    industry,
    topic,
    type,
    role,
    numOfQuestions,
    duration,
    difficulty
  );

  // ตรวจสอบคำถามที่สร้างขึ้น
  if (!questions || questions.length === 0) {
    return {
      success: false,
      message: "Failed to generate questions",
    };
  }

  try {
    // สร้าง Interview พร้อม Question (แต่ยังไม่สร้าง Result)
    await prisma.$transaction(async (tx) => {
      // สร้าง Interview
      const newInterview = await tx.interview.create({
        data: {
          industry,
          topic,
          role,
          numOfQuestions,
          difficulty,
          duration: duration * 60,
          durationLeft: duration * 60,
          userId: session.user.id as string,
          type,
          Question: {
            create: questions.map((q) => ({
              question: q.question,
            })),
          },
        },
        include: {
          Question: true,
        },
      });

      // สร้าง Result สำหรับแต่ละ Question
      if (newInterview?.Question?.length) {
        await Promise.all(
          newInterview.Question.map((q) =>
            tx.result.create({
              data: {
                questionId: q.id,
              },
            })
          )
        );
      }
    });

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

// Get User Interviews
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

// Delete User Interview
export const deleteUserInterview = async (interviewId: string) => {
  // ตรวจสอบการเข้าสู่ระบบ
  const session = await auth();

  // ตรวจสอบการเข้าสู่ระบบ
  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  try {
    // ลบ Interview
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

// Get Interview by ID
export const getInterviewById = async (interviewId: string) => {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      Question: {
        include: {
          result: true,
        },
      },
    },
  });

  return interview;
};

// Update Interview
export const updateInterview = async (
  interviewId: string,
  durationLeft: string | undefined,
  questionId: string,
  answer: string,
  completed?: boolean
) => {
  // Check user authentication
  const session = await auth();

  // Check user authentication
  if (!session || !session.user?.id) {
    return {
      success: false,
      message: "User not authenticated",
    };
  }

  try {
    // Find the interview
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
      include: {
        Question: {
          include: {
            result: true,
          },
        },
      },
    });

    // Check if the interview was found
    if (!interview) {
      return {
        success: false,
        message: "Interview not found",
      };
    }

    // Update the question
    if (answer) {
      // Find the question
      const questionIndex = interview.Question.findIndex(
        (q) => q.id === questionId
      );
      // Check if the question was found
      if (questionIndex === -1) {
        return {
          success: false,
          message: "Question not found",
        };
      }

      // Get the question
      const question = interview.Question[questionIndex];

      // Initialize scores
      let overallScore = 0;
      let relevance = 0;
      let clarity = 0;
      let completeness = 0;
      let suggestion = "No suggestion provided";

      // Evaluate the answer
      if (answer !== "pass") {
        ({ overallScore, relevance, clarity, completeness, suggestion } =
          await evaluateAnswer(question.question, answer));
      }

      // Update interview progress
      if (!question.completed) {
        interview.answered += 1;
      }

      // Update question
      question.answer = answer;
      question.completed = true;

      // Update interview duration
      interview.durationLeft = Number(durationLeft);

      // Update the question and result in the database
      await prisma.question.update({
        where: {
          id: questionId,
        },
        data: {
          answer: question.answer,
          completed: question.completed,
        },
      });

      await prisma.result.update({
        where: {
          id: question.result?.id,
        },
        data: {
          overallScore,
          relevance,
          clarity,
          completeness,
          suggestion,
        },
      });
    }

    // Check if all questions have been answered
    if (interview.answered === interview.Question.length) {
      interview.status = "completed";
    }

    // Check if the duration has run out
    if (durationLeft === "0") {
      interview.durationLeft = Number(durationLeft);
      interview.status = "completed";
    }

    // Check if the interview is completed
    if (completed) {
      interview.status = "completed";
    }

    // Update the interview in the database
    await prisma.interview.update({
      where: {
        id: interviewId,
      },
      data: {
        status: interview.status,
        durationLeft: interview.durationLeft,
        answered: interview.answered,
      },
    });

    return {
      success: true,
      message: "Interview updated successfully",
    };
  } catch (error) {
    console.error("Error updating interview:", error);
    return {
      success: false,
      message: "Failed to update interview",
    };
  }
};
