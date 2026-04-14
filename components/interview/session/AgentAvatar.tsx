"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AiPhone01Icon } from "@hugeicons/core-free-icons";

interface AgentAvatarProps {
  isSpeaking: boolean;
  status: string;
}

export default function AgentAvatar({ isSpeaking, status }: AgentAvatarProps) {
  const statusLabel: Record<string, string> = {
    greeting: "Greeting you...",
    "ai-speaking": "Speaking...",
    listening: "Listening...",
    processing: "Thinking...",
    closing: "Closing...",
    ended: "Interview ended",
    idle: "Ready",
    "requesting-permissions": "Setting up...",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        {isSpeaking && (
          <>
            <span className="absolute w-36 h-36 rounded-full bg-violet-500/10 animate-ping" style={{ animationDuration: "1.2s" }} />
            <span className="absolute w-28 h-28 rounded-full bg-violet-500/15 animate-ping" style={{ animationDuration: "1s" }} />
            <span className="absolute w-24 h-24 rounded-full bg-violet-500/20 animate-ping" style={{ animationDuration: "0.8s" }} />
          </>
        )}
        {/* Avatar circle */}
        <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-2xl transition-all duration-300 ${isSpeaking ? "shadow-violet-500/50 scale-105" : "shadow-violet-500/20"}`}>
          <HugeiconsIcon icon={AiPhone01Icon} size={36} color="white" strokeWidth={2} />
          {/* Speaking indicator dot */}
          <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#05050f] ${isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
        </div>
      </div>

      {/* Agent name + status */}
      <div className="text-center">
        <p className="text-white font-semibold text-base">RecruiterAI Agent</p>
        <p className={`text-xs font-medium mt-0.5 ${isSpeaking ? "text-violet-400" : "text-white/40"}`}>
          {statusLabel[status] ?? ""}
        </p>
      </div>

      {/* Waveform bars when speaking */}
      {isSpeaking && (
        <div className="flex items-end gap-0.5 h-6">
          {[4, 7, 10, 14, 10, 7, 12, 9, 6, 11, 8, 5].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-blue-400"
              style={{
                height: `${h * 1.5}px`,
                animation: "waveBar 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
