import { getInterviewById } from "@/actions/interview.action";
import ResultDetails from "@/components/result/ResultDetails";
import { ResultWithQuestionWithInterview } from "@/interface";

export default async function ResultDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const interview: ResultWithQuestionWithInterview | null =
    await getInterviewById(id);

  if (!interview) {
    throw new Error("Interview not found");
  }

  return <ResultDetails interview={interview} />;
}
