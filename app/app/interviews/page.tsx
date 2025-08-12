import { getInterviews } from "@/actions/interview.action";
import ListInterviews from "@/components/interview/ListInterview";

export default async function InterviewsPage({
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
    <ListInterviews
      interviews={interviews}
      totalPages={pagination.totalPages}
    />
  );
}
