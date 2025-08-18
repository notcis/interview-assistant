"use server";

import { Prisma } from "@/app/generated/prisma";
import { auth } from "@/auth";
import { LIST_PER_PAGE } from "@/constants/constants";
import { getFirstDayOfMonth, getToday } from "@/helpers";
import { InterviewBody } from "@/interface";
import { prisma } from "@/lib/prisma";
import { evaluateAnswer, generateQuestions } from "@/openai/openai";
import { console } from "inspector";
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
export const getInterviews = async ({
  filter,
  page = 1,
  admin,
}: {
  filter: { status?: string };
  page?: number;
  admin?: string;
}) => {
  // ตรวจสอบการเข้าสู่ระบบ
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  const filterStatus: Prisma.InterviewWhereInput = filter.status
    ? { status: filter.status }
    : {};

  let filterUser: Prisma.InterviewWhereInput = {};
  if (!admin) {
    filterUser = { userId: session.user.id };
  }

  const skip = (page - 1) * LIST_PER_PAGE;
  const take = LIST_PER_PAGE;

  // ค้นหาสัมภาษณ์แบบมี pagination
  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where: {
        ...filterUser,
        ...filterStatus,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
      include: {
        Question: {
          include: {
            result: true,
          },
        },
      },
    }),
    prisma.interview.count({
      where: {
        ...filterUser,
        ...filterStatus,
      },
    }),
  ]);

  return {
    interviews,
    pagination: {
      page,
      totalPages: Math.ceil(total / LIST_PER_PAGE),
    },
  };
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
    revalidatePath("/admin/interviews");

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

export const getInterviewStats = async ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const session = await auth();
  const start = new Date(startDate || getFirstDayOfMonth());
  const end = new Date(endDate || getToday());

  // รวมจำนวนสัมภาษณ์ทั้งหมด
  const totalAgg = await prisma.interview.aggregate({
    where: {
      userId: session?.user?.id,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _count: { id: true },
  });

  // รวมจำนวนสัมภาษณ์ทั้งหมด
  const totalInterviews = totalAgg._count.id;

  // ดึงสัมภาษณ์แต่ละวัน
  const interviews = await prisma.interview.findMany({
    where: {
      userId: session?.user?.id,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      Question: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // สร้างสถิติรายวัน
  const statsMap: Record<
    string,
    {
      totalInterviews: number;
      completedQuestions: number;
      unansweredQuestions: number;
    }
  > = {};

  // สร้างสถิติรายวัน
  interviews.forEach((interview) => {
    const date = interview.createdAt.toISOString().slice(0, 10);
    if (!statsMap[date]) {
      statsMap[date] = {
        totalInterviews: 0,
        completedQuestions: 0,
        unansweredQuestions: 0,
      };
    }
    statsMap[date].totalInterviews += 1;
    statsMap[date].completedQuestions += interview.Question.filter(
      (q) => q.completed
    ).length;
    statsMap[date].unansweredQuestions += interview.Question.filter(
      (q) => !q.completed
    ).length;
  });

  // สร้างสถิติรายวัน
  const stats = Object.entries(statsMap).map(([date, value]) => ({
    date,
    totalInterviews: value.totalInterviews,
    completedQuestions: value.completedQuestions,
    unansweredQuestions: value.unansweredQuestions,
    completionRate:
      value.completedQuestions + value.unansweredQuestions > 0
        ? Math.round(
            (value.completedQuestions /
              (value.completedQuestions + value.unansweredQuestions)) *
              100
          )
        : 0,
  }));

  // คำนวณ completionRate รวม
  const totalCompleted = interviews.reduce(
    (sum, interview) =>
      sum + interview.Question.filter((q) => q.completed).length,
    0
  );
  // รวมจำนวนคำถามทั้งหมด
  const totalQuestions = interviews.reduce(
    (sum, interview) => sum + interview.Question.length,
    0
  );
  // คำนวณอัตราการทำแบบสอบถาม
  const completionRate =
    totalQuestions > 0
      ? ((totalCompleted / totalQuestions) * 100).toFixed(2).toString()
      : "0.00";

  return {
    data: {
      totalInterviews,
      completionRate,
      stats,
    },
  };
};
