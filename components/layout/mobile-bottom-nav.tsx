"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Events",
    href: "/events",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Search",
    href: "/search",
    icon: () => (
      <div className="h-12 w-12 gradient-brand rounded-2xl flex items-center justify-center -mt-6 shadow-glow">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    ),
    center: true,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--card)] border-t border-[var(--border)] pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200",
                item.center && "relative"
              )}
            >
              <span className={cn(
                "transition-colors duration-200",
                item.center
                  ? ""
                  : active
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}>
                {item.icon(active)}
              </span>
              {!item.center && (
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                )}>
                  {item.label}
                </span>
              )}
              {active && !item.center && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-4 h-0.5 gradient-brand rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
