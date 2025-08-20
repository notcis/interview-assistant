"use client";

import Breadcrumb from "@/components/layout/breadcrumb/Breadcrumb";
import Loader from "@/components/layout/loader/Loader";
import AppSiderbar from "@/components/layout/sidebar/AppSidebar";
import usePageTitle from "@/hook/usePageTitle";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { title, breadcrumbs } = usePageTitle();
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loader />;
  }

  if (!session?.user.id) {
    router.push("/");
  }

  return (
    <>
      {status === "authenticated" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
          <div className="col-span-1 md:col-span-4 lg:col-span-3">
            <AppSiderbar />
          </div>
          <div className="col-span-1 md:col-span-8 lg:col-span-9">
            <Breadcrumb title={title} breadcrumbs={breadcrumbs} />

            {children}
          </div>
        </div>
      )}
    </>
  );
}
