import { getInterviews } from "@/actions/interview.action";
import ListResults from "@/components/result/ListResults";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: number }>;
}) {
  const { status, page } = await searchParams;
  const { interviews, pagination } = await getInterviews({
    filter: { status },
    page,
  });
  return (
    <ListResults interviews={interviews} totalPages={pagination.totalPages} />
  );
}
