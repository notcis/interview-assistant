"use client";

import React, { useState } from "react";

import ResultStats from "./ResultStats";
import { Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import QuestionCard from "./QuestionCard";
import { ResultWithQuestionWithInterview } from "@/interface";
import { getTotalPages, paginate } from "@/helpers";
import { QUESTIONS_PER_PAGE } from "@/constants/constants";

export default function ResultDetails({
  interview,
}: {
  interview: ResultWithQuestionWithInterview;
}) {
  // State to manage current page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the total number of pages
  const totalPages = getTotalPages(
    interview.Question.length,
    QUESTIONS_PER_PAGE
  );

  // Get the current questions for the page
  const currentQuestions = paginate(
    interview.Question,
    currentPage,
    QUESTIONS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    // Update the current page state
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="px-5">
        <ResultStats interview={interview} />

        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col md:flex-row justify-between items-center my-5 gap-4">
            <div className="flex flex-wrap gap-4">
              <Chip
                color="primary"
                startContent={
                  <Icon icon="tabler:circle-check-filled" width={20} />
                }
                variant="faded"
              >
                {interview.industry}
              </Chip>

              <Chip
                color="warning"
                startContent={
                  <Icon icon="tabler:circle-check-filled" width={20} />
                }
                variant="faded"
              >
                {interview.type}
              </Chip>

              <Chip
                color="secondary"
                startContent={
                  <Icon icon="tabler:circle-check-filled" width={20} />
                }
                variant="faded"
              >
                {interview.topic}
              </Chip>
            </div>
          </div>

          {currentQuestions.map((question, index) => (
            <QuestionCard
              key={index}
              index={(currentPage - 1) * QUESTIONS_PER_PAGE + index}
              question={question}
            />
          ))}

          <div className=" flex justify-center items-center mt-10">
            <Pagination
              isCompact
              showControls
              showShadow
              initialPage={1}
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
            />
          </div>

          <div className="flex justify-center items-center mt-10"></div>
        </div>
      </div>
    </div>
  );
}
