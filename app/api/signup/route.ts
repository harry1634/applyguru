import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, upsertUser } from "@/lib/user-store";
import type { StoredUser } from "@/lib/user-store";

export async function POST(req: NextRequest) {
  const { name, email, role } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  const existing = await getUserByEmail(email.trim().toLowerCase());
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in instead." },
      { status: 409 }
    );
  }

  const user = await upsertUser(
    { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), image: null },
    "email",
    (role as StoredUser["role"]) ?? "participant"
  );

  return NextResponse.json({ user });
}
