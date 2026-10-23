"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/lib/user-context";

export function DashboardHeader() {
  const { profile } = useUser();
  const router = useRouter();
  const firstName = profile.name.split(" ")[0];

  return (
    <header className="h-16 shrink-0 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <div className="h-7 w-7 gradient-brand rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">AG</span>
        </div>
      </Link>

      {/* Search — navigates to /search */}
      <button
        className="flex-1 max-w-lg"
        onClick={() => router.push("/search")}
      >
        <div className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] cursor-text hover:border-brand-400 transition-colors text-left w-full">
          <svg className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-sm text-[var(--muted-foreground)]">Search events, jobs, workshops…</span>
          <kbd className="hidden sm:inline-flex text-[10px] font-medium text-[var(--muted-foreground)] bg-[var(--border)] rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative h-9 w-9 rounded-xl hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[var(--card)]" />
        </button>

        {/* Bookmarks */}
        <Link href="/certificates" className="h-9 w-9 rounded-xl hover:bg-[var(--muted)] hidden sm:flex items-center justify-center text-[var(--muted-foreground)] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </Link>

        {/* Avatar — links to profile */}
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar name={profile.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[var(--foreground)] leading-none">{firstName}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">Gold · 1,240 XP</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
