import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobInvites, candidates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  const all = jobId
    ? await db.select().from(jobInvites).where(eq(jobInvites.jobId, parseInt(jobId)))
    : await db.select().from(jobInvites);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const { jobId, candidateId, interviewLink } = await req.json();
  if (!jobId || !candidateId) {
    return NextResponse.json({ error: "jobId and candidateId required" }, { status: 400 });
  }

  // Upsert — avoid duplicate invites for same job+candidate
  const existing = await db
    .select()
    .from(jobInvites)
    .where(and(eq(jobInvites.jobId, jobId), eq(jobInvites.candidateId, candidateId)));

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  const [invite] = await db
    .insert(jobInvites)
    .values({ jobId, candidateId, interviewLink: interviewLink ?? "", status: "pending" })
    .returning();

  // Update candidate status to "screening"
  await db.update(candidates).set({ status: "screening" }).where(eq(candidates.id, candidateId));

  return NextResponse.json(invite, { status: 201 });
}
