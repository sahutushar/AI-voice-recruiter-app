import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { interviewSessions, interviewSummaries, jobInvites, jobs, recruiterSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function analyzeTranscript(
  transcript: { role: string; text: string }[],
  candidateName: string, role: string, level: string, techstack: string, company: string
) {
  const transcriptText = transcript
    .map((m) => `${m.role === "ai" ? "Interviewer" : candidateName}: ${m.text}`)
    .join("\n\n");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `You are an expert technical recruiter. Analyze this interview transcript for a ${level} ${role} position at ${company} (Tech stack: ${techstack}).

TRANSCRIPT:
${transcriptText}

Return ONLY a valid JSON object (no markdown):
{
  "overallScore": <0-100>,
  "technicalScore": <0-100>,
  "communicationScore": <0-100>,
  "recommendation": "<hire|maybe|no>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "summary": "<2-3 sentence summary of candidate performance>"
}`;
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(raw);
  } catch {
    const answered = transcript.filter((m) => m.role === "user").length;
    return {
      overallScore: Math.min(100, answered * 12),
      technicalScore: Math.min(100, answered * 12),
      communicationScore: Math.min(100, answered * 14),
      recommendation: answered >= 5 ? "maybe" : "no",
      strengths: ["Participated in the interview", answered > 0 ? "Provided responses" : "Joined the session"],
      weaknesses: ["AI analysis unavailable — manual review required"],
      summary: `${candidateName} completed ${answered} questions for the ${level} ${role} role. Manual review recommended.`,
    };
  }
}

async function sendRecruiterNotification(
  recruiterEmail: string,
  candidateName: string,
  jobTitle: string,
  sessionId: number,
  analysis: { overallScore: number; recommendation: string; summary: string },
  origin: string
) {
  const recLabel = analysis.recommendation === "hire" ? "✅ Recommended to Hire"
    : analysis.recommendation === "maybe" ? "⚠️ Consider Further"
    : "❌ Not Recommended";

  const resultUrl = `${origin}/dashboard/candidates/${sessionId}`;

  await fetch("https://api.useplunk.com/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PLUNK_API_KEY}`,
    },
    body: JSON.stringify({
      to: recruiterEmail,
      subject: `Interview Complete: ${candidateName} — ${jobTitle}`,
      body: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0f0a1e; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #7c3aed, #2563eb); padding: 32px 32px 24px;">
    <div style="font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px;">RecruiterAI</div>
    <div style="font-size: 13px; color: rgba(255,255,255,0.7);">Interview Report Ready</div>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px;">Interview Completed</p>
    <p style="font-size: 14px; color: #94a3b8; margin: 0 0 24px;">
      <strong style="color: #e2e8f0;">${candidateName}</strong> has completed their AI voice interview for <strong style="color: #e2e8f0;">${jobTitle}</strong>.
    </p>

    <div style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 13px; color: #64748b; padding: 6px 0; width: 45%;">Candidate</td>
          <td style="font-size: 13px; color: #e2e8f0; font-weight: 600;">${candidateName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Position</td>
          <td style="font-size: 13px; color: #e2e8f0; font-weight: 600;">${jobTitle}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Overall Score</td>
          <td style="font-size: 20px; color: #a78bfa; font-weight: 800;">${analysis.overallScore}/100</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding: 6px 0;">Recommendation</td>
          <td style="font-size: 14px; font-weight: 700;">${recLabel}</td>
        </tr>
      </table>
    </div>

    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">AI Summary</p>
      <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">${analysis.summary}</p>
    </div>

    <div style="text-align: center;">
      <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px;">
        View Full Report →
      </a>
    </div>
  </div>
  <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
    <p style="font-size: 11px; color: #334155; margin: 0;">Sent by RecruiterAI · Automated interview report</p>
  </div>
</div>`.trim(),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { interviewId, candidateName, transcript, role, level, techstack, company, status } =
      await req.json();

    // 1. Look up invite by interviewLink to get jobId
    const inviteRows = await db
      .select()
      .from(jobInvites)
      .where(eq(jobInvites.interviewLink, interviewId));
    const invite = inviteRows[0];
    const jobId = invite?.jobId ?? 0;

    // 2. Save session with jobId
    const [session] = await db
      .insert(interviewSessions)
      .values({ interviewId, jobId, candidateName, transcript: JSON.stringify(transcript), status: status ?? "completed", role, level, techstack, company })
      .returning({ id: interviewSessions.id });

    // 3. Analyze transcript
    const analysis = await analyzeTranscript(transcript, candidateName, role, level, techstack, company);

    // 4. Save summary
    await db.insert(interviewSummaries).values({
      sessionId: session.id,
      overallScore: Math.min(100, Math.max(0, analysis.overallScore)),
      technicalScore: Math.min(100, Math.max(0, analysis.technicalScore)),
      communicationScore: Math.min(100, Math.max(0, analysis.communicationScore)),
      recommendation: analysis.recommendation,
      strengths: JSON.stringify(analysis.strengths),
      weaknesses: JSON.stringify(analysis.weaknesses),
      summary: analysis.summary,
    });

    // 5. Mark invite as completed
    if (invite) {
      await db.update(jobInvites).set({ status: "completed" }).where(eq(jobInvites.id, invite.id));
    }

    // 6. Send recruiter notification email (fire-and-forget)
    try {
      const origin = req.headers.get("origin") ?? req.headers.get("referer")?.replace(/\/$/, "") ?? "";
      const [settings] = await db.select({
        recruiterEmail: recruiterSettings.recruiterEmail,
        notifyOnComplete: recruiterSettings.notifyOnComplete,
      }).from(recruiterSettings).limit(1);
      const recruiterEmail = settings?.recruiterEmail || null;
      const shouldNotify = settings?.notifyOnComplete !== "false";
      const jobTitle = jobId
        ? (await db.select({ title: jobs.title }).from(jobs).where(eq(jobs.id, jobId)))[0]?.title ?? role
        : role;

      if (recruiterEmail && shouldNotify && process.env.PLUNK_API_KEY) {
        sendRecruiterNotification(recruiterEmail, candidateName, jobTitle, session.id, analysis, origin)
          .catch(() => { /* silent — don't fail the main flow */ });
      }
    } catch { /* silent */ }

    return NextResponse.json({ success: true, sessionId: session.id, analysis });
  } catch (e) {
    console.error("Interview complete error:", e);
    return NextResponse.json({ success: false, error: "Failed to save interview" }, { status: 500 });
  }
}
