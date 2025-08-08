import { adminPages, appPages, nestedPages } from "@/constants/page";
import { match } from "path-to-regexp";

// Interface for page titles and breadcrumbs
interface PageTitle {
  title: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}

// Get the page title and breadcrumbs based on the pathname
export const getPageTitle = (pathname: string): PageTitle => {
  // Determine which pages to check based on the pathname
  const pagesToCheck = pathname.includes("/admin")
    ? adminPages
    : [...appPages, ...nestedPages];

  // Match the pathname against the page paths
  for (const page of pagesToCheck) {
    // Create a matcher for the page path
    const matcher = match(page.path, { decode: decodeURIComponent });

    // Check if the pathname matches the page path
    if (matcher(pathname)) {
      return {
        title: page.title,
        breadcrumbs: page.breadcrumb,
      };
    }
  }

  // If no match is found, return a default "Not Found" page
  return {
    title: "Not Found",
    breadcrumbs: [{ name: "Not Found", path: "/" }],
  };
};
