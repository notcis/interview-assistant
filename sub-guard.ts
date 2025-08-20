import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function requireSubscription() {
  const session = await auth();

  if (
    session?.user?.subscribed !== "active" &&
    session?.user?.role !== "admin"
  ) {
    redirect("/");
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/");
  }
  return session;
}
