"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "gradient" | "subtle";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[var(--primary)] text-white hover:opacity-90 active:scale-[0.97] shadow-sm",
  gradient:
    "gradient-brand text-white hover:opacity-90 active:scale-[0.97] shadow-md shadow-violet-500/20",
  outline:
    "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] active:scale-[0.97]",
  ghost:
    "bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] active:scale-[0.97]",
  subtle:
    "bg-brand-100 text-brand-700 hover:bg-brand-200 active:scale-[0.97]",
  link: "bg-transparent underline-offset-4 hover:underline text-[var(--primary)] p-0 h-auto font-medium",
  destructive:
    "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97] shadow-sm",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "h-7 px-2.5 text-xs rounded-lg gap-1",
  sm: "h-8 px-3.5 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-xl",
  "icon-sm": "h-8 w-8 rounded-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          "whitespace-nowrap",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
