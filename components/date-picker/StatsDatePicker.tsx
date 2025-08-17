"use client";

import React from "react";
import { DateRangePicker, RangeValue } from "@heroui/react";
import {
  parseDate,
  getLocalTimeZone,
  CalendarDate,
} from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { getFirstDayOfMonth, getToday, updateSearchParams } from "@/helpers";
import { useRouter } from "next/navigation";

export default function StatsDatePicker() {
  const router = useRouter();

  const [value, setValue] = React.useState({
    start: parseDate(getFirstDayOfMonth()),
    end: parseDate(getToday()),
  });

  let formatter = useDateFormatter();

  const dateChangeHandler = (dates: RangeValue<CalendarDate> | null) => {
    if (dates) {
      setValue({
        start: dates.start,
        end: dates.end,
      });
      const start = formatter.format(dates.start.toDate(getLocalTimeZone()));
      const end = formatter.format(dates.end.toDate(getLocalTimeZone()));

      if (start && end) {
        let queryParams = new URLSearchParams();
        queryParams = updateSearchParams(queryParams, "start", start);
        queryParams = updateSearchParams(queryParams, "end", end);

        const path = `${window.location.pathname}?${queryParams.toString()}`;

        router.push(path);
      }
    }
  };

  return (
    <DateRangePicker
      className="max-w-xs"
      size="sm"
      label="Pick a date range"
      value={value}
      onChange={dateChangeHandler}
    />
  );
}
