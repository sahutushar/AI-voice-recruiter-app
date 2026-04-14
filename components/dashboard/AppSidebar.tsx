"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiPhone01Icon, Home01Icon, JobSearchIcon, UserGroupIcon,
  Calendar03Icon, Settings01Icon, CrownIcon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home",                    href: "/dashboard",            icon: Home01Icon },
  { label: "Jobs",                    href: "/dashboard/jobs",        icon: JobSearchIcon },
  { label: "Candidates",              href: "/dashboard/candidates",  icon: UserGroupIcon },
  { label: "Schedules & Interviews",  href: "/dashboard/interviews",  icon: Calendar03Icon },
  { label: "Settings",                href: "/dashboard/settings",    icon: Settings01Icon },
];

// Icon size is always 28 — never shrinks when collapsed
const ICON_SIZE = 28;
const ICON_STROKE = 2.5;

function FooterSection() {
  const { user } = useUser();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarFooter className="p-3 gap-3">
      {!collapsed && (
        <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 h-10 font-semibold gap-2">
          <HugeiconsIcon icon={CrownIcon} size={16} strokeWidth={2} />
          Upgrade Plan
        </Button>
      )}
      <div className={`flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}>
        <UserButton />
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user?.fullName ?? "User"}
            </span>
            <span className="text-xs text-sidebar-foreground/50 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        )}
      </div>
    </SidebarFooter>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">

      {/* Header */}
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
            <HugeiconsIcon icon={AiPhone01Icon} size={22} color="white" strokeWidth={2} />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
              Recruiter<span className="text-violet-400">AI</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup className="p-0 gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest text-sidebar-foreground/40 uppercase px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={{ children: item.label, side: "right" }}
                      className={`
                        h-12 rounded-xl font-semibold text-[15px]
                        ${isActive
                          ? "bg-violet-600/15 text-violet-400 hover:bg-violet-600/20 hover:text-violet-400"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }
                        ${collapsed ? "!px-0 justify-center" : "gap-3 px-3"}
                      `}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center w-full ${collapsed ? "justify-center" : "gap-3"}`}
                      >
                        {/* Icon size is always ICON_SIZE — never changes on collapse */}
                        <span className="shrink-0 flex items-center justify-center" style={{ width: ICON_SIZE, height: ICON_SIZE }}>
                          <HugeiconsIcon
                            icon={item.icon}
                            size={ICON_SIZE}
                            strokeWidth={isActive ? ICON_STROKE + 0.3 : ICON_STROKE}
                            className={isActive ? "text-violet-400" : ""}
                          />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer */}
      <FooterSection />
    </Sidebar>
  );
}
