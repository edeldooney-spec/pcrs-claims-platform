"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  AlertTriangle,
  CheckCircle2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/preview", label: "Dashboard", icon: LayoutDashboard },
  { href: "/preview/upload", label: "Upload Data", icon: Upload },
  { href: "/preview/findings", label: "Findings", icon: AlertTriangle },
  { href: "/preview/actions", label: "Actions", icon: CheckCircle2 },
];

export function NavSidebarPreview() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          CI
        </div>
        <div>
          <p className="text-sm font-semibold">Claims Intelligence</p>
          <p className="text-xs text-muted-foreground">PCRS Analysis</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/preview" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Dr. Murphy</p>
            <p className="text-xs text-muted-foreground">Elm Road Surgery</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
