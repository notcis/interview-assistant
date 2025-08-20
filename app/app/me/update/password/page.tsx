import UpdatePassword from "@/components/auth/UpdatePassword";
import { requireSubscription } from "@/sub-guard";

export default async function PasswordPage() {
  await requireSubscription();
  return <UpdatePassword />;
}
