import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobs, candidates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

function scoreCandidate(candidate: { name: string; roleApplied: string; skills: string; experience: string }, job: { title: string; skills: string; experience: string; description: string }): number {
  let score = 0;
  const jobSkills = (job.skills ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  const candSkills = (candidate.skills ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

  // Skill overlap
  const matched = jobSkills.filter((s) => candSkills.some((cs) => cs.includes(s) || s.includes(cs)));
  if (jobSkills.length > 0) score += Math.round((matched.length / jobSkills.length) * 60);

  // Role title similarity
  const jobTitle = job.title.toLowerCase();
  const candRole = candidate.roleApplied.toLowerCase();
  const titleWords = jobTitle.split(/\s+/);
  const roleWords = candRole.split(/\s+/);
  const titleMatch = titleWords.filter((w) => roleWords.includes(w)).length;
  if (titleWords.length > 0) score += Math.round((titleMatch / titleWords.length) * 30);

  // Experience bonus
  if (candidate.experience && job.experience) score += 10;

  return Math.min(100, score);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [job] = await db.select().from(jobs).where(eq(jobs.id, parseInt(id)));
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const allCandidates = await db.select().from(candidates);
  if (allCandidates.length === 0) return NextResponse.json({ matches: [] });

  const candidateList = allCandidates
    .map((c) => `ID:${c.id} | Name:${c.name} | Role:${c.roleApplied} | Skills:${c.skills} | Experience:${c.experience}`)
    .join("\n");

  const prompt = `You are a recruiter AI. Match candidates to this job posting.

JOB: ${job.title}
Required Skills: ${job.skills}
Experience: ${job.experience}
Description: ${job.description}

CANDIDATES:
${candidateList}

Return ONLY a JSON array (no markdown) of the top matching candidates (max 5), sorted by match score:
[{ "id": <number>, "name": "<string>", "matchScore": <0-100>, "reason": "<1 sentence why they match>" }]`;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const matches = JSON.parse(text);
      return NextResponse.json({ matches });
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      const msg = String((e as { message?: string })?.message ?? "").toLowerCase();
      if (status === 429 || status === 404 || msg.includes("quota") || msg.includes("not found")) continue;
      break;
    }
  }

  // Fallback: score-based matching without AI
  const scored = allCandidates
    .map((c) => ({
      id: c.id,
      name: c.name,
      matchScore: scoreCandidate(
        { name: c.name, roleApplied: c.roleApplied ?? "", skills: c.skills ?? "", experience: c.experience ?? "" },
        { title: job.title, skills: job.skills ?? "", experience: job.experience ?? "", description: job.description ?? "" }
      ),
      reason: `Matched based on skills and role alignment`,
    }))
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  return NextResponse.json({ matches: scored, _fallback: true });
}
