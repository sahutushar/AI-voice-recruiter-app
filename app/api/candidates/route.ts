import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, roleApplied, experience, skills, resumeText, notes } = body;

  if (!name?.trim() || !email?.trim() || !roleApplied?.trim()) {
    return NextResponse.json({ error: "Name, email and role are required" }, { status: 400 });
  }

  const [candidate] = await db
    .insert(candidates)
    .values({ name, email, phone: phone ?? "", roleApplied, experience: experience ?? "", skills: skills ?? "", resumeText: resumeText ?? "", notes: notes ?? "" })
    .returning();

  return NextResponse.json(candidate, { status: 201 });
}
