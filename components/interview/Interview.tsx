"use client";

import React, { use, useEffect, useState, useTransition } from "react";
import { Progress, Button, Alert, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

import PromptInputWithBottomActions from "./PromptInputWithBottomActions";
import { ResultWithQuestionWithInterview } from "@/interface";
import {
  formatTime,
  getAnswerFromLocalStorage,
  getAnswersFromLocalStorage,
  getFirstIncompleteQuestionIndex,
  saveAnswerToLocalStorage,
} from "@/helpers";
import toast from "react-hot-toast";
import { updateInterview } from "@/actions/interview.action";
import { useRouter } from "next/navigation";

export default function Interview({
  interview,
}: {
  interview: ResultWithQuestionWithInterview | null;
}) {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // Get the index of the first incomplete question
  const initialQuestionIndex = getFirstIncompleteQuestionIndex(
    interview?.Question || []
  );

  // Initialize state for the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(initialQuestionIndex);

  // Initialize state for the answers
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  // Initialize state for the current answer
  const [answer, setAnswer] = useState("");

  // Initialize state for the time left
  const [timeLeft, setTimeLeft] = useState(interview?.durationLeft);

  // Initialize state for the alert
  const [showAlert, setShowAlert] = useState(false);

  // Get the current question
  const currentQuestion = interview?.Question[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft === 0) {
      handleExitInterview();
    }
  }, [timeLeft]);

  // Effect to set the initial answer from local storage
  useEffect(() => {
    // Get stored answers from local storage
    const storedAnswers = getAnswersFromLocalStorage(interview?.id!);

    // Check if there are stored answers
    if (storedAnswers) {
      // Set the answers state with the stored answers
      setAnswers(storedAnswers);
    }
    // If no stored answers, save completed questions to local storage
    else {
      // Save completed questions to local storage
      interview?.Question.forEach((question) => {
        // Check if the question is completed
        if (question.completed) {
          // Save the answer to local storage
          saveAnswerToLocalStorage(
            interview?.id!,
            question.id,
            question.answer || ""
          );
        }
      });
    }
  }, [interview?.id]);

  // Effect to start the timer
  useEffect(() => {
    // Start the timer
    const timer = setInterval(() => {
      // Update the time left
      setTimeLeft((prevTime: number | undefined) => {
        // Check if the previous time is undefined
        if (prevTime === undefined) return undefined;
        // Check if the previous time is less than or equal to 1
        if (prevTime <= 1) {
          // Time is up
          clearInterval(timer);
          return 0;
        }
        // Check if the previous time is 10
        if (prevTime === 10) {
          // Show an alert
          setShowAlert(true);
        }
        // Decrement the time left
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup the timer on unmount
    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
  };

  // Save the answer to the database
  const saveAnswerToDB = async (questionId: string, answer: string) => {
    // Start the transition
    startTransition(async () => {
      // Update the interview in the database
      const res = await updateInterview(
        interview?.id!,
        timeLeft?.toString(),
        questionId,
        answer
      );

      if (!res.success) {
        toast.error(res.message);
        return;
      }
    });
  };

  // Handle moving to the next question
  const handleNextQuestion = async (answer: string) => {
    // Save the current answer
    const previousAnswer = answers[currentQuestion?.id || ""];

    // Check if the answer has changed and is not empty
    if (previousAnswer !== answer && answer.trim() !== "") {
      // Save the answer to the database
      await saveAnswerToDB(currentQuestion?.id || "", answer);
      // Save the answer to local storage
      saveAnswerToLocalStorage(
        interview?.id!,
        currentQuestion?.id || "",
        answer
      );
    }

    // Update the answers state
    setAnswers((prevAnswers) => {
      // Create a new answers object
      const newAnswers = { ...prevAnswers };
      // Update the answer for the current question
      newAnswers[currentQuestion?.id || ""] = answer;
      return newAnswers;
    });

    // Check if the current question is the last one
    if (currentQuestionIndex < (interview?.numOfQuestions ?? 0) - 1) {
      // Move to the next question
      setCurrentQuestionIndex((prevIndex) => {
        // Increment the index
        const newIndex = prevIndex + 1;

        // Get the next question
        const nextQuestion = interview?.Question[newIndex];
        // Set the answer from local storage
        setAnswer(
          getAnswerFromLocalStorage(interview?.id!, nextQuestion?.id || "")
        );

        return newIndex;
      });
    }
    // If the current question is the last one
    else if (currentQuestionIndex === (interview?.numOfQuestions ?? 0) - 1) {
      // Reset the index and set the answer from local storage
      setCurrentQuestionIndex(0);
      // Set the answer from local storage
      setAnswer(
        getAnswerFromLocalStorage(
          interview?.id!,
          interview?.Question[0]?.id || ""
        )
      );
    } else {
      // If there are no more questions, reset the answer
      setAnswer("");
    }
  };

  // Handle passing the question
  const handlePassQuestion = async () => {
    // Pass the question
    await handleNextQuestion("pass");
  };

  // Handle going to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        // Get the previous question
        const previousQuestion = interview?.Question[newIndex];
        // Set the answer from local storage
        setAnswer(
          getAnswerFromLocalStorage(interview?.id!, previousQuestion?.id || "")
        );
        return newIndex;
      });
    }
  };

  // Handle exiting the interview
  const handleExitInterview = async () => {
    // Start the transition
    startTransition(async () => {
      // Update the interview in the database
      const res = await updateInterview(
        interview?.id!,
        timeLeft?.toString(),
        currentQuestion?.id || "",
        answer,
        true
      );

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push("/app/interviews");
    });
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col gap-8">
      {showAlert && (
        <Alert
          color="danger"
          description={"Interview is about to exit"}
          title={"Time up!"}
        />
      )}

      <Progress
        aria-label="Interview Progress"
        className="w-full"
        color="default"
        label={`Question ${currentQuestionIndex + 1} of ${
          interview?.numOfQuestions
        }`}
        size="md"
        value={
          ((currentQuestionIndex + 1) / (interview?.numOfQuestions ?? 1)) * 100
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {interview?.Question.map((question, index) => (
          <Chip
            color={answers[question.id] ? "success" : "default"}
            size="sm"
            variant="flat"
            className="font-bold cursor-pointer text-sm radius-full"
            onClick={() => {
              setCurrentQuestionIndex(index);
              setAnswer(getAnswerFromLocalStorage(interview?.id!, question.id));
            }}
          >
            {index + 1}
          </Chip>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
        <span className="text-lg font-semibold text-right mb-2 sm:mb-0">
          Duration Left: {formatTime(timeLeft)}
        </span>
        <Button
          color="danger"
          startContent={<Icon icon="solar:exit-outline" fontSize={18} />}
          variant="solid"
          onPress={handleExitInterview}
          isDisabled={isPending}
          isLoading={isPending}
        >
          Save & Exit Interview
        </Button>
      </div>

      <span className="text-center h-40">
        <span
          className={`tracking-tight inline font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#FF1CF7] to-[#b249f8] text-[1.4rem] lg:text-2.5xl flex items-center justify-center h-full`}
        >
          {currentQuestion?.question}
        </span>
      </span>

      <PromptInputWithBottomActions
        key={currentQuestionIndex}
        value={answer}
        onChange={handleAnswerChange}
      />

      <div className="flex justify-between items-center mt-5">
        <Button
          className="bg-foreground px-[18px] py-2 font-medium text-background"
          radius="full"
          color="secondary"
          variant="flat"
          startContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:arrow-left-linear"
              width={20}
            />
          }
          onPress={handlePreviousQuestion}
          isDisabled={isPending || currentQuestionIndex === 0}
          isLoading={isPending}
        >
          Previous
        </Button>

        <Button
          className="px-[28px] py-2"
          radius="full"
          variant="flat"
          color="success"
          startContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:compass-big-bold"
              width={18}
            />
          }
          onPress={handlePassQuestion}
          isDisabled={isPending}
          isLoading={isPending}
        >
          Pass
        </Button>

        <Button
          className="bg-foreground px-[18px] py-2 font-medium text-background"
          radius="full"
          color="secondary"
          variant="flat"
          endContent={
            <Icon
              className="flex-none outline-none [&>path]:stroke-[2]"
              icon="solar:arrow-right-linear"
              width={20}
            />
          }
          onPress={() => handleNextQuestion(answer)}
          isDisabled={isPending}
          isLoading={isPending}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
