import { UserWithDetails } from "./interface";

export const isUserSubscribed = (user: UserWithDetails) => {
  return (
    user?.Subscription?.status === "active" ||
    user?.Subscription?.status === "past_due"
  );
};

export const isUserAdmin = (user: UserWithDetails) => {
  return user?.role?.includes("admin");
};
