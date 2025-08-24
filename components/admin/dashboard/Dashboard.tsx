"use client";

import React from "react";

import StatsDatePicker from "@/components/date-picker/StatsDatePicker";
import DashboardStats from "./DashboardStats";

const Dashboard = ({
  data,
}: {
  data: {
    totalUsers: number;
    activeSubscriptions: number;
    subscriptionsWorth: number;
    totalInterview: number;
    interviewCompletionRate: number;
    averageInterviewPerUser: number;
  };
}) => {
  return (
    <div>
      <div className="flex justify-between items-center my-16">
        <h1 className="text-xl font-bold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-3xl dark:text-white">
          Stats Overview:
        </h1>

        {/* Date Picker */}
        <StatsDatePicker />
      </div>

      <DashboardStats data={data} />
    </div>
  );
};

export default Dashboard;
