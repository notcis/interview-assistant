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
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ResultWithQuestionWithInterview } from "@/interface";
import { Key } from "@react-types/shared";
import { deleteUserInterview } from "@/actions/interview.action";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const columns = [
  { name: "INTERVIEW", uid: "interview" },
  { name: "RESULT", uid: "result" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

interface ListInterviewsProps {
  interviews: ResultWithQuestionWithInterview[] | [];
}

export default function ListInterviews({ interviews }: ListInterviewsProps) {
  const router = useRouter();

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
              <p className="text-bold text-sm capitalize">0/10</p>
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
              {interview.answered === 0 && interview.status !== "completed" ? (
                <Button
                  className="bg-foreground font-medium text-background w-full"
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
                <div className="relative flex items-center gap-2">
                  {interview.status === "completed" && (
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
      }
    },
    []
  );

  return (
    <div className="my-4">
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
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
