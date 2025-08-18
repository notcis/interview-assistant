import { getAllUsers } from "@/actions/auth.actions";
import ListUsers from "@/components/admin/users/ListUsers";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string; page?: number }>;
}) {
  const { page, subscription } = await searchParams;

  const { users, pagination } = await getAllUsers({
    filter: {
      subscription,
    },
    page,
  });

  return <ListUsers users={users} totalPages={pagination.totalPages} />;
}
