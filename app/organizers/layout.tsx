"use client";

import { SessionSync } from "@/components/auth/session-sync";

export default function OrganizersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionSync />
      {children}
    </>
  );
}
