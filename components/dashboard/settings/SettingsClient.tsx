"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building04Icon, AiPhone01Icon, Mail01Icon, Notification01Icon,
  Tick01Icon, Loading03Icon, InformationCircleIcon, RefreshIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = {
  companyName: string; companyIndustry: string; companyWebsite: string; recruiterEmail: string;
  agentName: string;
  questionsScreening: number; questionsTechnical: number; questionsHrFinal: number;
  silenceTimeoutMs: number; maxListenMs: number;
  greetingPrompt: string; questionStylePrompt: string; closingPrompt: string;
  minHireScore: number; technicalWeight: number; communicationWeight: number;
  notifyOnInvite: string; notifyOnComplete: string;
};

// ── Primitives ────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
        {hint && (
          <div className="group relative">
            <HugeiconsIcon icon={InformationCircleIcon} size={13} className="text-muted-foreground/50 cursor-help" strokeWidth={2} />
            <div className="absolute left-5 top-0 z-20 hidden group-hover:block bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground w-56 shadow-lg">{hint}</div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function NumberStepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-foreground font-bold hover:bg-muted transition-colors text-lg leading-none">−</button>
      <span className="w-10 text-center font-bold text-foreground text-sm">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-foreground font-bold hover:bg-muted transition-colors text-lg leading-none">+</button>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left group w-full">
      <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-violet-600" : "bg-muted"}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

function SliderField({ label, value, onChange, min, max, hint, suffix = "" }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; hint?: string; suffix?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <input type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-violet-500 h-1.5 rounded-full cursor-pointer" />
        <span className="text-sm font-bold text-foreground w-16 text-right shrink-0">{value}{suffix}</span>
      </div>
    </Field>
  );
}

function SectionHeader({ icon, label, color }: { icon: typeof Building04Icon; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-2.5 pb-4 border-b border-border`}>
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <HugeiconsIcon icon={icon} size={16} strokeWidth={2} className="text-white" />
      </div>
      <h2 className="text-base font-bold text-foreground">{label}</h2>
    </div>
  );
}

function SubSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SettingsClient({ settings: initial, defaults }: { settings: Settings; defaults: Settings }) {
  const [form, setForm] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      {/* ── Header box ── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0f0a1e] border border-violet-500/30 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-blue-600/15 rounded-full blur-2xl" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-xl shadow-violet-500/40 shrink-0">
            <HugeiconsIcon icon={AiPhone01Icon} size={22} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
            <p className="text-sm text-white/60 mt-0.5">Configure your AI recruiter, interview behaviour and notifications.</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 shrink-0">
          <button onClick={() => setForm(defaults)}
            className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
            <HugeiconsIcon icon={RefreshIcon} size={13} strokeWidth={2} />
            Reset
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <HugeiconsIcon icon={Tick01Icon} size={13} strokeWidth={2.5} /> Saved
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2 h-9">
            {saving
              ? <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" strokeWidth={2} />
              : <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ── 1. Company ── */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
        <SectionHeader icon={Building04Icon} label="Company" color="bg-violet-600" />

        <SubSection title="Company Profile" desc="Used in interview greetings, email invites and AI agent context.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name">
              <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Corp" />
            </Field>
            <Field label="Industry">
              <Input value={form.companyIndustry} onChange={(e) => set("companyIndustry", e.target.value)} placeholder="Software / Fintech / Healthcare" />
            </Field>
            <Field label="Website">
              <Input value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} placeholder="https://yourcompany.com" />
            </Field>
            <Field label="Recruiter Email" hint="Used as reply-to in invite emails and for notification alerts.">
              <Input value={form.recruiterEmail} onChange={(e) => set("recruiterEmail", e.target.value)} placeholder="recruiter@yourcompany.com" type="email" />
            </Field>
          </div>
        </SubSection>
      </div>

      {/* ── 2. AI Interview ── */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
        <SectionHeader icon={AiPhone01Icon} label="AI Interview" color="bg-blue-600" />

        {/* Agent Personality */}
        <SubSection title="Agent Personality" desc="Personalise the AI interviewer that candidates interact with.">
          <Field label="Agent Name" hint="The name the AI introduces itself as during interviews.">
            <Input value={form.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="Alex" className="max-w-xs" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            {[
              { label: "Hire Threshold", hint: "Minimum overall score for a 'Hire' recommendation.", key: "minHireScore" as const, min: 40, max: 95, suffix: "%" },
            ].map(({ label, hint, key, min, max, suffix }) => (
              <SliderField key={key} label={label} hint={hint} value={form[key] as number}
                onChange={(v) => set(key, v)} min={min} max={max} suffix={suffix} />
            ))}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score Preset</Label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{ label: "Lenient", value: 55 }, { label: "Balanced", value: 70 }, { label: "Strict", value: 85 }].map((p) => (
                  <button key={p.label} onClick={() => set("minHireScore", p.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${form.minHireScore === p.value ? "bg-violet-600/20 border-violet-500/40 text-violet-300" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                    {p.label} ({p.value}%)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SubSection>

        <div className="border-t border-border" />

        {/* Questions Count */}
        <SubSection title="Questions Count" desc="Number of questions the AI asks per interview type. Excludes greeting and closing.">
          <div className="flex flex-col gap-3">
            {[
              { label: "AI Screening", key: "questionsScreening" as const, desc: "Quick initial filter — keep it short (3–6 questions)." },
              { label: "Tech Interview", key: "questionsTechnical" as const, desc: "Deep technical dive — 6–12 questions recommended." },
              { label: "HR Final Round", key: "questionsHrFinal" as const, desc: "Culture fit & compensation — 4–8 questions." },
            ].map(({ label, key, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <NumberStepper value={form[key]} onChange={(v) => set(key, v)} min={2} max={15} />
              </div>
            ))}
          </div>
        </SubSection>

        <div className="border-t border-border" />

        {/* Timing & Behaviour */}
        <SubSection title="Timing & Behaviour" desc="Control how the AI detects when a candidate has finished speaking.">
          <div className="flex flex-col gap-5">
            <SliderField label="Silence Timeout"
              hint="How long (ms) of silence before the AI considers the answer complete."
              value={form.silenceTimeoutMs} onChange={(v) => set("silenceTimeoutMs", v)}
              min={500} max={6000} suffix="ms" />
            <SliderField label="Max Listen Time"
              hint="Maximum time the AI waits for a response before moving on."
              value={Math.round(form.maxListenMs / 1000)} onChange={(v) => set("maxListenMs", v * 1000)}
              min={15} max={120} suffix="s" />
          </div>
          {/* Score weights */}
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score Weights</p>
            <SliderField label="Technical Weight"
              hint="Weight given to technical accuracy in the overall score."
              value={form.technicalWeight}
              onChange={(v) => { set("technicalWeight", v); set("communicationWeight", 100 - v); }}
              min={20} max={80} suffix="%" />
            <SliderField label="Communication Weight"
              hint="Weight given to clarity and communication quality."
              value={form.communicationWeight}
              onChange={(v) => { set("communicationWeight", v); set("technicalWeight", 100 - v); }}
              min={20} max={80} suffix="%" />
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-muted flex">
                <div className="h-full bg-violet-500 transition-all" style={{ width: `${form.technicalWeight}%` }} />
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${form.communicationWeight}%` }} />
              </div>
              <div className="flex gap-3 text-xs shrink-0">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Tech {form.technicalWeight}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Comm {form.communicationWeight}%</span>
              </div>
            </div>
          </div>
        </SubSection>

        <div className="border-t border-border" />

        {/* Custom AI Prompts */}
        <SubSection title="Custom AI Prompts" desc="Override default AI messages. Leave blank to use auto-generated text.">
          <Field label="Greeting Prompt" hint="Variables: {candidateName}, {role}, {level}, {company}, {totalQuestions}, {agentName}">
            <textarea value={form.greetingPrompt} onChange={(e) => set("greetingPrompt", e.target.value)}
              rows={3} placeholder={`e.g. "Hello {candidateName}, welcome to your {level} {role} interview at {company}. I'll ask you {totalQuestions} questions. Let's begin!"`}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
          <Field label="Question Style Instructions" hint="e.g. 'Focus on system design', 'Ask STAR-format questions', 'Prioritise hands-on experience'">
            <textarea value={form.questionStylePrompt} onChange={(e) => set("questionStylePrompt", e.target.value)}
              rows={4} placeholder={`e.g. "Focus on practical problem-solving. Ask STAR-format behavioral questions. Include at least 2 system design questions."`}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex flex-wrap gap-2 mt-1">
              {["Focus on system design", "Ask STAR behavioral questions", "Prioritise hands-on experience", "Include culture fit questions", "Ask about past failures", "Focus on leadership examples"].map((preset) => (
                <button key={preset}
                  onClick={() => set("questionStylePrompt", form.questionStylePrompt ? `${form.questionStylePrompt} ${preset}.` : `${preset}.`)}
                  className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full hover:bg-violet-500/20 transition-colors">
                  + {preset}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Closing Prompt" hint="Variables: {candidateName}, {role}, {company}, {agentName}">
            <textarea value={form.closingPrompt} onChange={(e) => set("closingPrompt", e.target.value)}
              rows={3} placeholder={`e.g. "Thank you {candidateName}, that concludes your {role} interview at {company}. Our team will review your responses and reach out within 3 business days."`}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </Field>
        </SubSection>
      </div>

      {/* ── 3. Email & Invites ── */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
        <SectionHeader icon={Mail01Icon} label="Email & Invites" color="bg-emerald-600" />

        <SubSection title="Invite Email Settings" desc="Configure how interview invitation emails are sent to candidates.">
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={Mail01Icon} size={16} className="text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Sender Address</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Emails are sent from <span className="text-foreground font-mono">onboarding@resend.dev</span> via Resend. Candidates reply to your recruiter email.</p>
                </div>
              </div>
            </div>
            <Field label="Reply-To Email" hint="Candidates who reply to invite emails will reach this address.">
              <Input value={form.recruiterEmail} onChange={(e) => set("recruiterEmail", e.target.value)}
                placeholder="recruiter@yourcompany.com" type="email" />
            </Field>
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interview Link Format</p>
              <div className="flex flex-col gap-2">
                {[
                  { prefix: "SCR", label: "AI Screening", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
                  { prefix: "TEC", label: "Tech Interview", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
                  { prefix: "HRF", label: "HR Final Round", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                ].map((t) => (
                  <div key={t.prefix} className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${t.color}`}>{t.prefix}</span>
                    <span className="text-xs text-muted-foreground">{t.label} — link format: <span className="font-mono text-foreground/70">/interview/{t.prefix}-[jobId]-[ts]-[rand]</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SubSection>
      </div>

      {/* ── 4. Notifications ── */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
        <SectionHeader icon={Notification01Icon} label="Notifications" color="bg-amber-600" />

        <SubSection title="Notification Settings" desc="Control which events trigger an email alert to your recruiter inbox.">
          <div className="flex flex-col gap-4">
            <Toggle
              checked={form.notifyOnInvite === "true"}
              onChange={(v) => set("notifyOnInvite", v ? "true" : "false")}
              label="Interview invite sent"
              desc="Get notified when an invitation email is dispatched to a candidate."
            />
            <Toggle
              checked={form.notifyOnComplete === "true"}
              onChange={(v) => set("notifyOnComplete", v ? "true" : "false")}
              label="Interview completed"
              desc="Get notified when a candidate finishes their AI voice interview with a full report link."
            />
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-start gap-2 mt-1">
            <HugeiconsIcon icon={InformationCircleIcon} size={15} className="text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-muted-foreground">
              Notifications are sent to{" "}
              {form.recruiterEmail
                ? <span className="text-foreground font-medium">{form.recruiterEmail}</span>
                : <span className="text-amber-400">no email set — add one in Company or Email &amp; Invites above.</span>}
            </p>
          </div>
        </SubSection>

        <div className="border-t border-border" />

        {/* Danger zone */}
        <SubSection title="Danger Zone" desc="Irreversible actions — proceed with caution.">
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-sm font-semibold text-foreground">Reset All Settings</p>
              <p className="text-xs text-muted-foreground mt-0.5">Restore all settings to their factory defaults.</p>
            </div>
            <Button variant="outline" onClick={() => setForm(defaults)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 shrink-0">
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              Reset
            </Button>
          </div>
        </SubSection>
      </div>

      {/* ── Sticky bottom save bar (mobile) ── */}
      <div className="sticky bottom-4 flex justify-end">
        <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-black/20">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <HugeiconsIcon icon={Tick01Icon} size={13} strokeWidth={2.5} /> All changes saved
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2 h-9">
            {saving
              ? <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" strokeWidth={2} />
              : <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

    </div>
  );
}
