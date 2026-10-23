"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    category: string;
    emoji: string;
    organizer: string;
    date: string;
    location: string;
    mode: string;
    price: number;
    spots: number;
    tags: string[];
    gradient: string;
  };
  index?: number;
}

const categoryVariants: Record<string, "volunteer" | "college" | "workshop" | "webinar" | "summit" | "career" | "education" | "default"> = {
  volunteer: "volunteer",
  college:   "college",
  workshop:  "workshop",
  webinar:   "webinar",
  summit:    "summit",
  career:    "career",
  education: "education",
};

export function EventCard({ event, index = 0 }: EventCardProps) {
  const [saved, setSaved] = useState(false);

  const badgeVariant = categoryVariants[event.category] ?? "default";

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift overflow-hidden flex flex-col animate-slide-up"
    >
      {/* Color banner */}
      <div className={`h-28 bg-gradient-to-br ${event.gradient} relative flex items-center justify-center overflow-hidden`}>
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
          {event.emoji}
        </span>

        {/* Top badges */}
        <div className="absolute top-3 left-3">
          <Badge variant={badgeVariant} size="sm">
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          className="absolute top-3 right-3 h-7 w-7 rounded-lg glass flex items-center justify-center text-white hover:scale-110 transition-all"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <svg
            className="w-3.5 h-3.5"
            fill={saved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>

        {/* Price tag */}
        <div className="absolute bottom-3 right-3">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-lg",
            event.price === 0
              ? "bg-emerald-500 text-white"
              : "bg-white text-slate-800"
          )}>
            {event.price === 0 ? "Free" : `₹${event.price.toLocaleString("en-IN")}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link href={`/events/${event.id}`} className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 flex-1 mb-3">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{event.organizer}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {event.date}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location} ·{" "}
            <span className={event.mode === "Online" ? "text-emerald-600 font-medium" : "text-blue-600 font-medium"}>
              {event.mode}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 text-xs">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-500 font-semibold">{event.spots}</span>
            <span className="text-[var(--muted-foreground)]"> spots left</span>
          </div>
          <span className="text-xs font-semibold text-[var(--primary)] flex items-center gap-0.5">
            View
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}
