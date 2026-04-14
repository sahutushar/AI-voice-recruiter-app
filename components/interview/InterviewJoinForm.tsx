"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InterviewJoinForm({ interviewId }: { interviewId: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!name.trim()) {
      setError("Please enter your full name to continue.");
      return;
    }
    // Navigate to the live interview session
    router.push(`/interview/${interviewId}/session?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-white/80">Your Full Name</label>
        <div className="relative">
          <HugeiconsIcon
            icon={UserIcon}
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            strokeWidth={2}
          />
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="e.g. Sarah Johnson"
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:ring-violet-500/20 rounded-xl text-base"
          />
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      </div>

      <Button
        onClick={handleStart}
        className="h-12 w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-500/25 border-0"
      >
        Start Interview
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.5} className="ml-1" />
      </Button>

      <p className="text-xs text-white/30 text-center leading-relaxed">
        By starting, you agree that this interview may be recorded and analyzed by our AI system.
      </p>
    </div>
  );
}
