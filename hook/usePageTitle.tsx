"use client";

import { getPageTitle } from "@/helpers/pageTitles";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const usePageTitle = () => {
  // State to hold the title and breadcrumbs
  const [title, setTitle] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ name: string; path: string }>
  >([]);

  // Get the current pathname
  const pathname = usePathname();

  // Update the title and breadcrumbs when the pathname changes
  useEffect(() => {
    const { title, breadcrumbs } = getPageTitle(pathname);
    setTitle(title);
    setBreadcrumbs(breadcrumbs || [{ name: "Home", path: "/" }]);
  }, [pathname]);

  // Return the title and breadcrumbs
  return { title, breadcrumbs };
};

export default usePageTitle;
