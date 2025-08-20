import { getInterviews } from "@/actions/interview.action";
import ListInterviews from "@/components/interview/ListInterview";
import { requireAdmin } from "@/sub-guard";

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: number }>;
}) {
  await requireAdmin();

  const { status, page } = await searchParams;
  const { interviews, pagination } = await getInterviews({
    filter: { status },
    page,
    admin: "admin", // Assuming this is for admin view, set to true
  });
  return (
    <ListInterviews
      interviews={interviews}
      totalPages={pagination.totalPages}
    />
  );
}
