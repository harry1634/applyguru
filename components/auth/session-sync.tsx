"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/user-context";

export function SessionSync() {
  const { data: session, status } = useSession();
  const { profile, updateProfile } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const { name, email } = session.user;
    if (!email) return;

    // Sync Google name/email into local profile context
    if (email !== profile.email) {
      updateProfile({ name: name ?? profile.name, email });
    }

    // Check if user needs to complete onboarding
    fetch(`/api/users?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ user }) => {
        if (user && !user.onboardingComplete && pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      })
      .catch(() => {});
  }, [status, session]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
