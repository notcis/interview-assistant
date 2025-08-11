import { getInterviews } from "@/actions/interview.action";
import ListResults from "@/components/result/ListResults";

export default async function ResultPage() {
  const interviews = await getInterviews();
  return <ListResults interviews={interviews} />;
}
