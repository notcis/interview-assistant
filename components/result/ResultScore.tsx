"use client";

import React from "react";
import { Card, Progress } from "@heroui/react";

export default function ResultScore() {
  const data = [
    {
      title: "Overall Score",
      value: 5,
      status: "good",
    },
    {
      title: "Clarity",
      value: 4,
      status: "warn",
    },
    {
      title: "Relevance",
      value: 4,
      status: "warn",
    },
    {
      title: "Completeness",
      value: 6,
      status: "warn",
    },
  ];

  return (
    <div className="mt-5 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
      {data.map((item, index) => (
        <Card
          key={index}
          className="flex flex-col border border-transparent p-3 dark:border-default-100"
        >
          <div>
            <div className="my-1 text-sm font-medium text-default-500">
              {item.title}
            </div>
            <div className="text-xl font-semibold text-default-700">
              {item.value}/10
            </div>
          </div>
          <Progress
            size="sm"
            className="mt-2"
            color={item.status === "good" ? "success" : "warning"}
            value={item.value * 10}
          />
        </Card>
      ))}
    </div>
  );
}
