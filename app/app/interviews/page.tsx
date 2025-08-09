import { getInterviews } from "@/actions/interview.action";
import ListInterviews from "@/components/interview/ListInterview";

export default async function InterviewsPage() {
  const interviewsRaw = await getInterviews();

  console.log(interviewsRaw);

  // Transform Question.result to an array if it's not null
  const interviews = interviewsRaw.map((interview: any) => ({
    ...interview,
    Question: interview.Question.map((q: any) => ({
      ...q,
      result: q.result ? [q.result] : null,
    })),
  }));

  return <ListInterviews interviews={interviews} />;
}
