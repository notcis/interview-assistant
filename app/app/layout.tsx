"use client";

import Breadcrumb from "@/components/layout/breadcrumb/Breadcrumb";
import AppSiderbar from "@/components/layout/sidebar/AppSidebar";
import usePageTitle from "@/hook/usePageTitle";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { title, breadcrumbs } = usePageTitle();

  const pathname = usePathname();

  const noBreadcrumbs = ["/app/interviews/conduct/"];

  const showBreadcrumbs = !noBreadcrumbs.some((path) =>
    pathname.startsWith(path)
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <div className="col-span-1 md:col-span-4 lg:col-span-3">
        <AppSiderbar />
      </div>
      <div className="col-span-1 md:col-span-8 lg:col-span-9">
        {showBreadcrumbs && (
          <Breadcrumb title={title} breadcrumbs={breadcrumbs} />
        )}
        {children}
      </div>
    </div>
  );
}
