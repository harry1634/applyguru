import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, updateUserRole, updateUserProfile, deleteUser, getUserByEmail, incrementUserStat } from "@/lib/user-store";
import type { StoredUser, UserStats } from "@/lib/user-store";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (email) {
    const user = await getUserByEmail(email);
    return NextResponse.json({ user: user ?? null });
  }
  const users = await getAllUsers();
  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as {
    email: string;
    role?: StoredUser["role"];
    phone?: string;
    college?: string;
    name?: string;
    incrementStat?: keyof UserStats;
  };
  if (body.role) await updateUserRole(body.email, body.role);
  if (body.phone !== undefined || body.college !== undefined || body.name !== undefined) {
    await updateUserProfile(body.email, { phone: body.phone, college: body.college, name: body.name });
  }
  if (body.incrementStat) await incrementUserStat(body.email, body.incrementStat);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { email } = await req.json() as { email: string };
  await deleteUser(email);
  return NextResponse.json({ success: true });
}
