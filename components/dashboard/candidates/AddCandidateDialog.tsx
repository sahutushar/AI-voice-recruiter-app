"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload04Icon,
  UserAdd01Icon,
  Cancel01Icon,
  Tick01Icon,
  Loading03Icon,
  DocumentAttachmentIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CandidateForm {
  name: string;
  email: string;
  phone: string;
  roleApplied: string;
  experience: string;
  skills: string;
  notes: string;
  resumeText: string;
}

const empty: CandidateForm = {
  name: "", email: "", phone: "", roleApplied: "",
  experience: "", skills: "", notes: "", resumeText: "",
};

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddCandidateDialog({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<CandidateForm>(empty);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [errors, setErrors] = useState<Partial<CandidateForm>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof CandidateForm, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

// ── Handle resume upload ──
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setParsing(true);

    try {
      // Send file directly as FormData — server handles PDF/DOCX/TXT extraction
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/candidates/parse-resume", {
        method: "POST",
        body: formData, // no Content-Type header — browser sets multipart boundary
      });
      const data = await res.json();
      if (res.status === 429) throw new Error(data.error ?? "AI quota exhausted. Please wait a few minutes.");
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        roleApplied: data.roleApplied ?? "",
        experience: data.experience ?? "",
        skills: data.skills ?? "",
        notes: "",
        resumeText: data.resumeText ?? "",
      });
      if (data._warning) setParseError(data._warning);
    } catch (err) {
      console.error("Resume parse error:", err);
      setParseError("Could not parse resume. Please fill the form manually.");
    } finally {
      setParsing(false);
    }
  };

  // ── Validate ──
  const validate = () => {
    const e: Partial<CandidateForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.roleApplied.trim()) e.roleApplied = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
    } catch {
      setErrors({ name: "Failed to save candidate. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <HugeiconsIcon icon={UserAdd01Icon} size={18} className="text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Candidate</h2>
              <p className="text-xs text-muted-foreground">Upload resume or fill manually</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* Resume upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFile} />
            {parsing ? (
              <div className="flex flex-col items-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} size={28} className="text-violet-400 animate-spin" strokeWidth={2} />
                <p className="text-sm font-medium text-foreground">Parsing resume with AI...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                <HugeiconsIcon icon={DocumentAttachmentIcon} size={28} className="text-emerald-400" strokeWidth={2} />
                <p className="text-sm font-semibold text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <HugeiconsIcon icon={Upload04Icon} size={28} className="text-muted-foreground group-hover:text-violet-400 transition-colors" strokeWidth={2} />
                <p className="text-sm font-semibold text-foreground">Upload Resume</p>
                <p className="text-xs text-muted-foreground">TXT, PDF, DOC — AI will auto-fill the form</p>
              </div>
            )}
          </div>

          {parseError && (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">{parseError}</p>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Full Name *", placeholder: "Sarah Johnson" },
              { key: "email", label: "Email *", placeholder: "sarah@example.com" },
              { key: "phone", label: "Phone", placeholder: "+1 234 567 8900" },
              { key: "roleApplied", label: "Role Applied For *", placeholder: "Senior Frontend Engineer" },
              { key: "experience", label: "Experience", placeholder: "3 years" },
              { key: "skills", label: "Skills", placeholder: "React, TypeScript, Node.js" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
                <Input
                  value={form[key as keyof CandidateForm]}
                  onChange={(e) => set(key as keyof CandidateForm, e.target.value)}
                  placeholder={placeholder}
                  className={errors[key as keyof CandidateForm] ? "border-red-500/50" : ""}
                />
                {errors[key as keyof CandidateForm] && (
                  <p className="text-xs text-red-400">{errors[key as keyof CandidateForm]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</Label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional notes about this candidate..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0"
            >
              {saving ? (
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin mr-2" strokeWidth={2} />
              ) : (
                <HugeiconsIcon icon={Tick01Icon} size={16} className="mr-2" strokeWidth={2} />
              )}
              {saving ? "Saving..." : "Save Candidate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
