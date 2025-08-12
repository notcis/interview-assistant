"use client";

import React from "react";
import { Card, Progress } from "@heroui/react";
import { Result } from "@/interface";

export default function ResultScore({ result }: { result: Result | null }) {
  const data = [
    {
      title: "คะแนนรวม",
      value: result?.overallScore,
      status: "good",
    },
    {
      title: "ความชัดเจน",
      value: result?.clarity,
      status: "warn",
    },
    {
      title: "ความเกี่ยวข้อง",
      value: result?.relevance,
      status: "warn",
    },
    {
      title: "ความสมบูรณ์",
      value: result?.completeness,
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
            value={item.value ? item.value * 10 : 0}
          />
        </Card>
      ))}
    </div>
  );
}
