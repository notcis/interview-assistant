"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ResultWithQuestionWithInterview } from "@/interface";
import { Key } from "@react-types/shared";
import { deleteUserInterview } from "@/actions/interview.action";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { calculateAverageScore } from "@/helpers";
import CustomPagination from "../layout/pagination/CustomPagination";
import { isAdminPath } from "@/auth-guard";

export const columns = [
  { name: "INTERVIEW", uid: "interview" },
  { name: "RESULT", uid: "result" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

interface ListInterviewsProps {
  interviews: ResultWithQuestionWithInterview[] | [];
  totalPages: number;
}

export default function ListInterviews({
  interviews,
  totalPages,
}: ListInterviewsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const deleteInterviewHandle = async (interviewId: string) => {
    const res = await deleteUserInterview(interviewId);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
  };

  const renderCell = React.useCallback(
    (interview: ResultWithQuestionWithInterview, columnKey: Key) => {
      const cellValue =
        interview[columnKey as keyof ResultWithQuestionWithInterview];

      switch (columnKey) {
        case "interview":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{interview.topic}</p>
              <p className="text-bold text-sm capitalize text-default-400">
                {interview.type}
              </p>
            </div>
          );
        case "result":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">
                {calculateAverageScore(interview.Question)} / 10
              </p>
              <p className="text-bold text-sm capitalize text-default-400">
                {interview.numOfQuestions} questions
              </p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={interview.status === "completed" ? "success" : "danger"}
              size="sm"
              variant="flat"
            >
              {cellValue as string}
            </Chip>
          );
        case "actions":
          return (
            <>
              {interview.answered === 0 &&
              interview.status !== "completed" &&
              !isAdminPath(pathname) ? (
                <Button
                  className="bg-foreground font-medium text-background"
                  color="secondary"
                  endContent={
                    <Icon icon="solar:arrow-right-linear" fontSize={20} />
                  }
                  variant="flat"
                  as={Link}
                  href={`/app/interviews/conduct/${interview.id}`}
                >
                  Start
                </Button>
              ) : (
                <div className="relative flex justify-center items-center gap-2">
                  {interview.status !== "completed" &&
                    !isAdminPath(pathname) && (
                      <Tooltip color="danger" content="Continue Interview">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                          <Icon
                            icon="solar:round-double-alt-arrow-right-bold"
                            fontSize={22}
                            onClick={() =>
                              router.push(
                                `/app/interviews/conduct/${interview.id}`
                              )
                            }
                          />
                        </span>
                      </Tooltip>
                    )}

                  {interview.status === "completed" && (
                    <Tooltip content="View Result">
                      <span className="text-lg text-defaul-400 cursor-pointer active:opacity-50">
                        <Icon
                          icon="solar:eye-broken"
                          fontSize={22}
                          onClick={() =>
                            router.push(`/app/results/${interview.id}`)
                          }
                        />
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip color="danger" content="Delete Interview">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <Icon
                        icon="solar:trash-bin-trash-outline"
                        fontSize={21}
                        onClick={() => deleteInterviewHandle(interview.id)}
                      />
                    </span>
                  </Tooltip>
                </div>
              )}
            </>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  let queryParams;

  const handleStatusChange = (status: string) => {
    queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("status") && status === "all") {
      queryParams.delete("status");
    } else if (queryParams.has("status")) {
      queryParams.set("status", status);
    } else {
      queryParams.append("status", status);
    }

    const path = `${window.location.pathname}?${queryParams.toString()}`;
    router.push(path);
  };

  return (
    <div className="my-4">
      <div className="flex justify-end items-center mb-4">
        <Select
          size="sm"
          className="max-w-xs"
          label="Select a status"
          onChange={(event) => handleStatusChange(event.target.value)}
        >
          <SelectItem key="all">ALL</SelectItem>
          <SelectItem key="pending">PENDING</SelectItem>
          <SelectItem key="completed">COMPLETED</SelectItem>
        </Select>
      </div>
      <Table aria-label="Interviews Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={interviews}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey) as React.ReactNode}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className=" flex justify-center items-center mt-10">
          <CustomPagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
