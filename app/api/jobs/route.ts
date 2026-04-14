import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, department, location, type, experience, salary, description, requirements, skills, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [job] = await db
    .insert(jobs)
    .values({
      title,
      department: department ?? "",
      location: location ?? "",
      type: type ?? "full-time",
      experience: experience ?? "",
      salary: salary ?? "",
      description: description ?? "",
      requirements: requirements ?? "",
      skills: skills ?? "",
      status: status ?? "draft",
    })
    .returning();

  return NextResponse.json(job, { status: 201 });
}
