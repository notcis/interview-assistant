import { getInterviewById } from "@/actions/interview.action";
import Interview from "@/components/interview/Interview";
import { ResultWithQuestionWithInterview } from "@/interface";
import { requireSubscription } from "@/sub-guard";

export default async function InterviewConductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSubscription();
  const { id } = await params;

  const interview: ResultWithQuestionWithInterview | null =
    await getInterviewById(id);

  if (interview?.status === "completed") {
    throw new Error("Interview already completed");
  }

  return <Interview interview={interview} />;
}
