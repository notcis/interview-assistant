import AppSiderbar from "@/components/layout/sidebar/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <div className="col-span-1 md:col-span-4 lg:col-span-3">
        <AppSiderbar />
      </div>
      <div className="col-span-1 md:col-span-8 lg:col-span-9">{children}</div>
    </div>
  );
}
