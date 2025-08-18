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
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Key } from "@react-types/shared";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  AuthProvider,
  User,
  ProfilePicture,
  Subscription,
} from "@/app/generated/prisma";
import CustomPagination from "@/components/layout/pagination/CustomPagination";
import UpdateUser from "./UpdateUser";
import { cancelSubscription } from "@/actions/payment.action";
import { isUserSubscribed } from "@/auth-guard";
import { deleteUserData } from "@/actions/auth.actions";

export const columns = [
  { name: "USER", uid: "user" },
  { name: "LOGINS", uid: "logins" },
  { name: "SUBSCRIPTION", uid: "subscription" },
  { name: "ACTIONS", uid: "actions" },
];

type UserWithRelations = User & {
  ProfilePicture: ProfilePicture | null;
  authProvider: AuthProvider[];
  Subscription: Subscription | null;
};

export default function ListUsers({
  users,
  totalPages,
}: {
  users: UserWithRelations[];
  totalPages: number;
}) {
  const router = useRouter();

  const handleUnsubscribe = async (email: string) => {
    const res = await cancelSubscription(email);
    if (!res.success) {
      toast.error(res.message || "Failed to unsubscribe");
      return;
    }
    if (!res.subscription) {
      toast.error("Failed to unsubscribe");
      return;
    }
    toast.success("Subscription updated successfully!");
  };

  const deleteUserHandle = async (userId: string) => {
    const res = await deleteUserData(userId);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
  };

  const renderCell = React.useCallback(
    (user: UserWithRelations, columnKey: Key) => {
      const cellValue = user[columnKey as keyof UserWithRelations];

      switch (columnKey) {
        case "user":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm ">{user.name}</p>
              <p className="text-bold text-sm  text-default-400">
                {user.email}
              </p>
            </div>
          );
        case "logins":
          return (
            <div className="flex flex-col gap-2">
              {user?.authProvider?.map((provider, index) => (
                <Chip key={index} color="warning" size="sm" variant="flat">
                  {provider.provider}
                </Chip>
              ))}
            </div>
          );
        case "subscription":
          return (
            <Chip
              className="capitalize"
              color={
                user.Subscription?.status === "active" ? "success" : "danger"
              }
              size="sm"
              variant="flat"
            >
              {user.Subscription?.status ?? "No Subscription"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <UpdateUser user={user} />

              {isUserSubscribed(user as any) && (
                <Tooltip color="danger" content="Cancel Subscription">
                  <span className="text-lg text-warning cursor-pointer active:opacity-50">
                    <Icon
                      icon="solar:shield-cross-bold"
                      fontSize={22}
                      onClick={() => handleUnsubscribe(user.email || "")}
                    />
                  </span>
                </Tooltip>
              )}

              <Tooltip color="danger" content="Delete User">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Icon
                    icon="solar:trash-bin-trash-outline"
                    fontSize={21}
                    onClick={() => deleteUserHandle(user.id)}
                  />
                </span>
              </Tooltip>
            </div>
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
    if (queryParams.has("subscription") && status === "all") {
      queryParams.delete("subscription");
    } else if (queryParams.has("subscription")) {
      queryParams.set("subscription", status);
    } else {
      queryParams.append("subscription", status);
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
          <SelectItem key="active">ACTIVE</SelectItem>
          <SelectItem key="canceled">CANCELED</SelectItem>
          <SelectItem key="past_due">PAST DUE</SelectItem>
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
        <TableBody items={users}>
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
