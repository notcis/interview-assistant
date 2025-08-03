"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import ResultScore from "./ResultScore";

const QuestionCard = () => {
  return (
    <Card className={"border-small"} shadow="sm">
      <CardBody className="flex h-full flex-row items-start gap-3 p-4">
        <div className={"item-center flex rounded-medium border p-2"}>
          <span style={{ fontSize: 16 }} className="text-bold">
            1
          </span>
        </div>
        <div className="flex flex-col">
          <p className="text-large">Question Here</p>

          <p className="text-medium mt-5 mb-1 text-warning">Your Answer:</p>
          <p className="text-small text-default-400">Answer here</p>

          <ResultScore />

          <p className="text-medium mt-5 mb-1 text-success">
            Remarks/Suggestion:
          </p>
          <p className="text-small text-default-400">No remarks/suggestions</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default QuestionCard;
