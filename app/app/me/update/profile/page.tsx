import UpdateProfile from "@/components/auth/UpdateProfile";
import { requireSubscription } from "@/sub-guard";

export default async function UpdateProfilePage() {
  await requireSubscription();
  return <UpdateProfile />;
}
