import { getInterviews } from "@/actions/interview.action";
import ListInterviews from "@/components/interview/ListInterview";
import { requireSubscription } from "@/sub-guard";

export default async function InterviewsPage({
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
    <ListInterviews
      interviews={interviews}
      totalPages={pagination.totalPages}
    />
  );
}
