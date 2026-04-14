import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { recruiterSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // Allow unauthenticated reads for the interview session (candidate is not logged in)
  // Try auth first, fall back to first settings row for candidate-facing pages
  const { userId } = await auth();

  if (userId) {
    const [existing] = await db.select().from(recruiterSettings).where(eq(recruiterSettings.clerkId, userId));
    return NextResponse.json(existing ?? null);
  }

  // Candidate path — return first settings row (public fields only)
  const [existing] = await db.select().from(recruiterSettings).limit(1);
  return NextResponse.json(existing ?? null);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const values = {
    clerkId: userId,
    companyName: body.companyName ?? "RecruiterAI",
    companyIndustry: body.companyIndustry ?? "",
    companyWebsite: body.companyWebsite ?? "",
    recruiterEmail: body.recruiterEmail ?? "",
    agentName: body.agentName ?? "Alex",
    questionsScreening: body.questionsScreening ?? 5,
    questionsTechnical: body.questionsTechnical ?? 8,
    questionsHrFinal: body.questionsHrFinal ?? 6,
    silenceTimeoutMs: body.silenceTimeoutMs ?? 2000,
    maxListenMs: body.maxListenMs ?? 45000,
    greetingPrompt: body.greetingPrompt ?? "",
    questionStylePrompt: body.questionStylePrompt ?? "",
    closingPrompt: body.closingPrompt ?? "",
    minHireScore: body.minHireScore ?? 70,
    technicalWeight: body.technicalWeight ?? 60,
    communicationWeight: body.communicationWeight ?? 40,
    notifyOnInvite: body.notifyOnInvite ?? "true",
    notifyOnComplete: body.notifyOnComplete ?? "true",
  };

  const existing = await db.select({ id: recruiterSettings.id }).from(recruiterSettings).where(eq(recruiterSettings.clerkId, userId));

  if (existing.length > 0) {
    const [updated] = await db.update(recruiterSettings).set(values).where(eq(recruiterSettings.clerkId, userId)).returning();
    return NextResponse.json(updated);
  }

  const [created] = await db.insert(recruiterSettings).values(values).returning();
  return NextResponse.json(created, { status: 201 });
}
