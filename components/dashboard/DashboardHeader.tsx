"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard":             "Dashboard",
  "/dashboard/jobs":        "Jobs",
  "/dashboard/candidates":  "Candidates",
  "/dashboard/interviews":  "Schedules & Interviews",
  "/dashboard/settings":    "Settings",
};

function getPageName(pathname: string): string {
  // Exact match first
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname];
  // Prefix match for nested routes
  for (const [key, name] of Object.entries(PAGE_NAMES)) {
    if (key !== "/dashboard" && pathname.startsWith(key)) return name;
  }
  return "Dashboard";
}

export default function DashboardHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-3 sm:px-4 border-b border-border bg-background shrink-0">
      {/* Left: sidebar toggle + page name */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">{pageName}</span>
          <span className="text-xs text-muted-foreground">
            Welcome, {user?.firstName ?? "there"} 👋
          </span>
        </div>
      </div>

      {/* Right: profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold leading-none text-foreground">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
