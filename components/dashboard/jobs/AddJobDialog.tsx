"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  JobSearchIcon,
  Cancel01Icon,
  Tick01Icon,
  Loading03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobForm {
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  skills: string;
  status: string;
}

const empty: JobForm = {
  title: "", department: "", location: "", type: "full-time",
  experience: "", salary: "", description: "", requirements: "", skills: "", status: "draft",
};

interface Props { onClose: () => void; onSaved: () => void; }

export default function AddJobDialog({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<JobForm>(empty);
  const [aiTitle, setAiTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSource, setAiSource] = useState<"ai" | "template" | null>(null);
  const [errors, setErrors] = useState<Partial<JobForm>>({});

  const set = (k: keyof JobForm, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleAIGenerate = async () => {
    if (!aiTitle.trim()) { setAiSource(null); return; }
    setGenerating(true);
    setAiSource(null);
    try {
      const res = await fetch("/api/jobs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: aiTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      const { _source, ...jobData } = data;
      setForm({ ...jobData, status: "draft" });
      setAiSource(_source ?? "ai");
    } catch {
      setAiSource(null);
    } finally {
      setGenerating(false);
    }
  };

  const validate = () => {
    const e: Partial<JobForm> = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (status: "draft" | "active") => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
    } catch {
      setErrors({ title: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof JobForm; label: string; placeholder: string; span?: boolean }[] = [
    { key: "title", label: "Job Title *", placeholder: "Senior Frontend Engineer" },
    { key: "department", label: "Department", placeholder: "Engineering" },
    { key: "location", label: "Location", placeholder: "Remote / New York, NY" },
    { key: "type", label: "Job Type", placeholder: "full-time" },
    { key: "experience", label: "Experience", placeholder: "3-5 years" },
    { key: "salary", label: "Salary Range", placeholder: "$90k - $120k" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <HugeiconsIcon icon={JobSearchIcon} size={18} className="text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">New Job Posting</h2>
              <p className="text-xs text-muted-foreground">Use AI to fill or enter manually</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* AI Fill Section */}
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="text-violet-400" strokeWidth={2} />
              <span className="text-sm font-semibold text-violet-300">Fill with AI</span>
              <span className="text-xs text-muted-foreground">— enter a job title and let AI generate the full posting</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={aiTitle}
                onChange={(e) => { setAiTitle(e.target.value); setAiSource(null); }}
                placeholder="e.g. Senior React Developer"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
              />
              <Button
                onClick={handleAIGenerate}
                disabled={generating}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 gap-2 shrink-0"
              >
                {generating ? (
                  <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" strokeWidth={2} />
                ) : (
                  <HugeiconsIcon icon={SparklesIcon} size={15} strokeWidth={2} />
                )}
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
            {aiSource === "ai" && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <HugeiconsIcon icon={SparklesIcon} size={12} strokeWidth={2} /> AI generated — review and edit before saving
              </p>
            )}
            {aiSource === "template" && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <HugeiconsIcon icon={SparklesIcon} size={12} strokeWidth={2} /> Template applied (AI quota reached) — please review and edit
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className={errors[key] ? "border-red-500/50" : ""}
                />
                {errors[key] && <p className="text-xs text-red-400">{errors[key]}</p>}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief overview of the role and responsibilities..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Requirements */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requirements</Label>
            <textarea
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              placeholder="- Bachelor's degree in CS&#10;- 3+ years React experience&#10;- Strong TypeScript skills"
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Required Skills</Label>
            <Input
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="React, TypeScript, Node.js, GraphQL"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave("active")}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
            >
              {saving ? (
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin mr-2" strokeWidth={2} />
              ) : (
                <HugeiconsIcon icon={Tick01Icon} size={16} className="mr-2" strokeWidth={2} />
              )}
              {saving ? "Saving..." : "Publish Job"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
