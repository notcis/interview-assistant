import { getInterviews } from "@/actions/interview.action";
import ListResults from "@/components/result/ListResults";
import { requireSubscription } from "@/sub-guard";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: number }>;
}) {
  await requireSubscription();
  const { status, page } = await searchParams;
  const { interviews, pagination } = await getInterviews({
    filter: { status },
    page,
  });
  return (
    <ListResults interviews={interviews} totalPages={pagination.totalPages} />
  );
}
