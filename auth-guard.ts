export const isUserSubscribed = (user: any) => {
  return user?.subscribed === "active" || user?.subscribed === "past_due";
};

export const isUserAdmin = (user: any) => {
  return user?.role === "admin";
};

export const isAdminPath = (pathname: string) => {
  return pathname.includes("/admin");
};
