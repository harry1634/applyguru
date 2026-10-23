import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

const gradients = [
  "from-violet-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500",
];

function Avatar({ src, name = "", size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const gradientIndex =
    name.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0",
          sizeMap[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br shrink-0",
        gradient,
        sizeMap[size],
        className
      )}
      aria-label={name}
    >
      {initials || "?"}
    </div>
  );
}

function AvatarGroup({
  users,
  max = 3,
  size = "sm",
}: {
  users: { src?: string | null; name?: string }[];
  max?: number;
  size?: AvatarProps["size"];
}) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u, i) => (
        <Avatar
          key={i}
          src={u.src}
          name={u.name}
          size={size}
          className="ring-2 ring-[var(--card)]"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-[10px] font-medium",
            "bg-[var(--muted)] text-[var(--muted-foreground)] ring-2 ring-[var(--card)]",
            sizeMap[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
