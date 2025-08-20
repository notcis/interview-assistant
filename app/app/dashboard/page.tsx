import { getInterviewStats } from "@/actions/interview.action";
import Dashboard from "@/components/dashboard/Dashboard";
import { requireSubscription } from "@/sub-guard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireSubscription();
  const { start, end } = await searchParams;
  const { data } = await getInterviewStats({
    startDate: start,
    endDate: end,
  });

  return <Dashboard data={data} />;
}
