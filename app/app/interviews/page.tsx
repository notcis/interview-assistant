import { getInterviews } from "@/actions/interview.action";
import ListInterviews from "@/components/interview/ListInterview";

export default async function InterviewsPage() {
  const interviewsRaw = await getInterviews();

  return <ListInterviews interviews={interviewsRaw} />;
}
