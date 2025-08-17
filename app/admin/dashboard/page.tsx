import { getDashboardStats } from "@/actions/auth.actions";
import Dashboard from "@/components/admin/dashboard/Dashboard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start, end } = await searchParams;
  const data = await getDashboardStats({ startDate: start, endDate: end });

  return <Dashboard data={data} />;
}
