"use client";

import type { CardProps } from "@heroui/react";

import React from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
  PolarAngleAxis,
} from "recharts";
import { Card, cn } from "@heroui/react";

interface CircleChartProps {
  title: string;
  color: string;
  total?: number;
  strValue?: string;
  chartData: {
    name: string;
    value: number;
    fill: string;
  }[];
}

export default function ResultTable() {
  const data: CircleChartProps[] = [
    {
      title: "Questions",
      color: "default",
      total: 3,
      strValue: `1 / 3`,
      chartData: [
        {
          name: "Questions",
          value: 2,
          fill: "hsl(var(--heroui-primary))",
        },
      ],
    },
    {
      title: "Result",
      color: "success",
      total: 10,
      strValue: `4 / 10`,
      chartData: [
        {
          name: "Result",
          value: 4,
          fill: "hsl(var(--heroui-success))",
        },
      ],
    },
    {
      title: "Duration",
      color: "warning",
      total: 34,
      strValue: "34",
      chartData: [
        {
          name: "Time",
          value: 34,
          fill: "hsl(var(--heroui-warning))",
        },
      ],
    },
    {
      title: "Difficulty",
      color: "danger",
      total: 3,
      strValue: "3",
      chartData: [
        {
          name: "Difficulty",
          value: 3,
          fill: "hsl(var(--heroui-danger))",
        },
      ],
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((item, index) => (
        <CircleChartCard key={index} {...item} />
      ))}
    </div>
  );
}

const CircleChartCard: React.FC<CircleChartProps> = ({
  title,
  color,
  chartData,
  total,
  strValue,
  ...props
}) => {
  return (
    <Card
      className={cn(
        "h-[220px] border border-transparent dark:border-default-100"
      )}
      {...props}
    >
      <div className="flex h-full gap-x-3">
        <ResponsiveContainer
          className="[&_.recharts-surface]:outline-none"
          height="100%"
          width="100%"
        >
          <RadialBarChart
            barSize={10}
            cx="50%"
            cy="50%"
            data={chartData}
            endAngle={-45}
            innerRadius={90}
            outerRadius={70}
            startAngle={225}
          >
            <PolarAngleAxis
              angleAxisId={0}
              domain={[0, total ?? 0]}
              tick={false}
              type="number"
            />
            <RadialBar
              angleAxisId={0}
              animationDuration={1000}
              animationEasing="ease"
              background={{
                fill: "hsl(var(--heroui-default-100))",
              }}
              cornerRadius={12}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--heroui-${
                    color === "default" ? "foreground" : color
                  }))`}
                />
              ))}
            </RadialBar>
            <g>
              <text textAnchor="middle" x="50%" y="48%">
                <tspan
                  className="fill-default-500 text-tiny"
                  dy="-0.5em"
                  x="50%"
                >
                  {chartData?.[0].name}
                </tspan>
                <tspan
                  className="fill-foreground text-medium font-semibold"
                  dy="1.5em"
                  x="50%"
                >
                  total
                </tspan>
              </text>
            </g>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
