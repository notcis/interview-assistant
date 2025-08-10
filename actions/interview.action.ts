"use server";

import { auth } from "@/auth";
import { InterviewBody } from "@/interface";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/openai/openai";
import { revalidatePath } from "next/cache";

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
