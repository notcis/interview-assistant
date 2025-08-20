import NewInterview from "@/components/interview/NewInterview";
import { requireSubscription } from "@/sub-guard";

export default async function NewInterviewPage() {
  await requireSubscription();
  return <NewInterview />;
}
