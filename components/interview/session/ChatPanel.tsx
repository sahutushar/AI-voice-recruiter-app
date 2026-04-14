"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AiPhone01Icon, UserIcon } from "@hugeicons/core-free-icons";
import type { ChatMessage } from "./useInterviewSession";

interface ChatPanelProps {
  messages: ChatMessage[];
  currentTranscript: string;
  status: string;
  candidateName: string;
}

export default function ChatPanel({ messages, currentTranscript, status, candidateName }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <h3 className="text-sm font-semibold text-white">Live Transcript</h3>
        <p className="text-xs text-white/40 mt-0.5">Conversation will appear here</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/20 text-sm text-center">Interview transcript will appear here once it begins.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "ai" ? "bg-gradient-to-br from-violet-500 to-blue-600" : "bg-white/10"}`}>
              <HugeiconsIcon
                icon={msg.role === "ai" ? AiPhone01Icon : UserIcon}
                size={14}
                color="white"
                strokeWidth={2}
              />
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex items-center gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <span className="text-xs font-semibold text-white/60">
                  {msg.role === "ai" ? "RecruiterAI" : candidateName}
                </span>
                <span className="text-[10px] text-white/25">{formatTime(msg.timestamp)}</span>
              </div>
              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-violet-600/20 border border-violet-500/20 text-white/90 rounded-tl-sm"
                  : "bg-white/10 border border-white/10 text-white/80 rounded-tr-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Live transcript while user is speaking */}
        {status === "listening" && currentTranscript && (
          <div className="flex gap-2.5 flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              <HugeiconsIcon icon={UserIcon} size={14} color="white" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-1 max-w-[80%] items-end">
              <span className="text-xs font-semibold text-white/40">Speaking...</span>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-white/5 border border-white/10 text-white/50 italic">
                {currentTranscript}
              </div>
            </div>
          </div>
        )}

        {/* AI thinking indicator */}
        {status === "processing" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={AiPhone01Icon} size={14} color="white" strokeWidth={2} />
            </div>
            <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-violet-600/20 border border-violet-500/20 flex gap-1.5 items-center">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === "listening" ? "bg-emerald-400 animate-pulse" :
              status === "ai-speaking" || status === "greeting" || status === "closing" ? "bg-violet-400 animate-pulse" :
              "bg-white/20"
            }`} />
            <span className="text-xs text-white/40 font-medium">
              {status === "listening" ? "🎤 Listening — speak your answer" :
               status === "ai-speaking" || status === "greeting" || status === "closing" ? "AI is speaking..." :
               status === "processing" ? "Processing your response..." :
               status === "ended" ? "Interview completed" : "Waiting..."}
            </span>
          </div>
          {status === "listening" && (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
              LIVE
            </span>
          )}
        </div>
        {status === "listening" && (
          <p className="text-[11px] text-white/25 mt-1">
            {currentTranscript ? "Speak freely — pause for 2-3s when done." : "Mic is open. Start speaking now..."}
          </p>
        )}
      </div>
    </div>
  );
}
