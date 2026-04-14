import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/db";
import { recruiterSettings } from "@/db/schema";

interface InvitePayload {
  candidates: { id: number; name: string; email: string; interviewLink: string }[];
  jobTitle: string;
  interviewType: string;
}

const TYPE_LABELS: Record<string, string> = {
  screening:  "AI Screening",
  technical:  "Tech Interview",
  "hr-final": "HR Final Round",
};

function buildEmailHtml(name: string, jobTitle: string, typeLabel: string, interviewUrl: string): string {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#0f0a1e;color:#e2e8f0;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:32px 32px 24px;">
    <div style="font-size:22px;font-weight:800;color:white;margin-bottom:4px;">RecruiterAI</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.7);">AI-Powered Hiring Platform</div>
  </div>
  <div style="padding:32px;">
    <p style="font-size:18px;font-weight:700;color:#f1f5f9;margin:0 0 8px;">Hi ${name} 👋</p>
    <p style="font-size:14px;color:#94a3b8;margin:0 0 24px;line-height:1.6;">
      You have been selected to interview for <strong style="color:#e2e8f0;">${jobTitle}</strong>.
      We would like to invite you to complete a <strong style="color:#a78bfa;">${typeLabel}</strong>.
    </p>
    <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:20px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Interview Details</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="font-size:13px;color:#64748b;padding:4px 0;width:40%;">Position</td><td style="font-size:13px;color:#e2e8f0;font-weight:600;">${jobTitle}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding:4px 0;">Interview Type</td><td style="font-size:13px;color:#e2e8f0;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="font-size:13px;color:#64748b;padding:4px 0;">Format</td><td style="font-size:13px;color:#e2e8f0;font-weight:600;">AI Voice Interview</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${interviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">
        Start Interview
      </a>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Or copy this link:</div>
      <div style="font-size:12px;color:#a78bfa;font-family:monospace;word-break:break-all;">${interviewUrl}</div>
    </div>
    <p style="font-size:12px;color:#475569;line-height:1.6;margin:0;">
      Please ensure you are in a quiet environment with a working microphone before starting.
    </p>
  </div>
  <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
    <p style="font-size:11px;color:#334155;margin:0;">Sent by RecruiterAI</p>
  </div>
</div>`.trim();
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await params;

  const body: InvitePayload = await req.json();
  const { candidates, jobTitle, interviewType } = body;

  if (!candidates?.length) {
    return NextResponse.json({ error: "No candidates provided" }, { status: 400 });
  }

  // Validate all candidates have emails
  const invalid = candidates.filter((c) => !c.email || !c.name);
  if (invalid.length > 0) {
    console.error("[send-invites] Candidates missing email/name:", invalid.map((c) => c.id));
    return NextResponse.json({ error: `${invalid.length} candidate(s) missing email address` }, { status: 400 });
  }

  const typeLabel = TYPE_LABELS[interviewType] ?? interviewType;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    req.headers.get("origin") ??
    req.headers.get("referer")?.replace(/\/$/, "") ??
    "http://localhost:3000";

  console.log(`[send-invites] Sending ${candidates.length} invites for "${jobTitle}" (${typeLabel})`);

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "<your_resend_api_key>") {
    console.error("[send-invites] RESEND_API_KEY is not configured in .env.local");
    return NextResponse.json(
      { error: "Email service not configured. Add RESEND_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  const resend = new Resend(resendKey);

  const results = await Promise.allSettled(
    candidates.map(async (c) => {
      const interviewUrl = `${origin}/interview/${c.interviewLink}`;
      const html = buildEmailHtml(c.name, jobTitle, typeLabel, interviewUrl);
      const subject = `Interview Invitation: ${typeLabel} for ${jobTitle}`;

      console.log(`[send-invites] Sending to ${c.email}`);

      const { error } = await resend.emails.send({
        from: "RecruiterAI <onboarding@resend.dev>",
        to: c.email,
        subject,
        html,
      });

      if (error) {
        console.error(`[send-invites] Resend error for ${c.email}:`, error);
        throw new Error(`Failed to send to ${c.email}: ${error.message}`);
      }

      console.log(`[send-invites] Sent to ${c.email} ✓`);
      return { id: c.id, email: c.email, success: true };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed    = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason as Error)?.message ?? "Unknown");
    console.error("[send-invites] Failures:", errors);
  }

  // Notify recruiter if notifyOnInvite is enabled (fire-and-forget)
  try {
    const [settings] = await db
      .select({ recruiterEmail: recruiterSettings.recruiterEmail, notifyOnInvite: recruiterSettings.notifyOnInvite })
      .from(recruiterSettings)
      .limit(1);
    if (settings?.notifyOnInvite !== "false" && settings?.recruiterEmail && process.env.PLUNK_API_KEY) {
      fetch("https://api.useplunk.com/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PLUNK_API_KEY}` },
        body: JSON.stringify({
          to: settings.recruiterEmail,
          subject: `${succeeded} Interview Invite${succeeded !== 1 ? "s" : ""} Sent — ${jobTitle}`,
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f0a1e;color:#e2e8f0;border-radius:12px;"><h2 style="color:#a78bfa;margin:0 0 12px;">Invites Dispatched</h2><p style="color:#94a3b8;margin:0;"><strong style="color:#e2e8f0;">${succeeded}</strong> candidate${succeeded !== 1 ? "s" : ""} invited to <strong style="color:#e2e8f0;">${typeLabel}</strong> for <strong style="color:#e2e8f0;">${jobTitle}</strong>.</p><p style="color:#64748b;font-size:12px;margin:16px 0 0;">Sent by RecruiterAI</p></div>`,
        }),
      }).catch(() => {});
    }
  } catch { /* silent */ }

  return NextResponse.json({ succeeded, failed, total: candidates.length });
}
