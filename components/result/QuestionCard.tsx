"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import ResultScore from "./ResultScore";
import { Question } from "@/interface";

const QuestionCard = ({
  index,
  question,
}: {
  index: number;
  question: Question;
}) => {
  return (
    <Card className={"border-small"} shadow="sm">
      <CardBody className="flex h-full flex-row items-start gap-3 p-4">
        <div className={"item-center flex rounded-medium border p-2"}>
          <span style={{ fontSize: 16 }} className="text-bold">
            {index + 1}
          </span>
        </div>
        <div className="flex flex-col">
          <p className="text-large">{question.question}</p>

          <p className="text-medium mt-5 mb-1 text-warning">คำตอบของคุณ :</p>
          <p className="text-small text-default-400">{question.answer}</p>

          <ResultScore result={question.result} />

          <p className="text-medium mt-5 mb-1 text-success">คำแนะนำ :</p>
          <p className="text-small text-default-400">
            {question.result?.suggestion}
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default QuestionCard;
