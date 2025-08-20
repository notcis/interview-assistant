import { getDashboardStats } from "@/actions/auth.actions";
import Dashboard from "@/components/admin/dashboard/Dashboard";
import { requireAdmin } from "@/sub-guard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireAdmin();

  const { start, end } = await searchParams;
  const data = await getDashboardStats({ startDate: start, endDate: end });

  return <Dashboard data={data} />;
}
