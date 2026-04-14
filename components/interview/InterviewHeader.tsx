import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiPhone01Icon } from "@hugeicons/core-free-icons";

export default function InterviewHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#05050f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <HugeiconsIcon icon={AiPhone01Icon} size={18} color="white" strokeWidth={2} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Recruiter<span className="text-violet-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold tracking-wide">Interview Active</span>
        </div>
      </div>
    </header>
  );
}
