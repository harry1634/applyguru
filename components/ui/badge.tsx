import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default" | "outline" | "subtle"
    | "success" | "warning" | "danger" | "info"
    | "volunteer" | "college" | "workshop" | "webinar"
    | "summit" | "job" | "career" | "education";
  size?: "sm" | "md";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:   "bg-[var(--primary)] text-white",
  outline:   "border border-[var(--border)] text-[var(--foreground)] bg-transparent",
  subtle:    "bg-brand-100 text-brand-700",
  success:   "bg-emerald-100 text-emerald-700",
  warning:   "bg-amber-100 text-amber-700",
  danger:    "bg-red-100 text-red-600",
  info:      "bg-blue-100 text-blue-700",
  volunteer: "bg-emerald-100 text-emerald-700",
  college:   "bg-blue-100 text-blue-700",
  workshop:  "bg-orange-100 text-orange-700",
  webinar:   "bg-purple-100 text-purple-700",
  summit:    "bg-indigo-100 text-indigo-700",
  job:       "bg-cyan-100 text-cyan-700",
  career:    "bg-pink-100 text-pink-700",
  education: "bg-yellow-100 text-yellow-700",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
