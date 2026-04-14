"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight01Icon,
  CallRinging01Icon,
  AudioWave01Icon,
  CheckmarkCircle01Icon,
  AiVoiceIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => router.push(isSignedIn ? "/dashboard" : "/sign-up");
  const handleDemo = () => router.push(isSignedIn ? "/dashboard" : "/sign-in");
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05050f] pt-16">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text Content */}
        <div className="flex-1 text-center lg:text-left">
          <Badge className="mb-6 inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Voice Recruiting
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Let AI Handle Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Initial Screening
            </span>{" "}
            Calls
          </h1>

          <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Import your candidate list, and our AI voice agent automatically calls each candidate,
            conducts structured screening interviews, scores responses, and schedules follow-up
            interviews — all without lifting a finger.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-violet-500/30 text-base px-8 h-12"
            >
              {isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={handleDemo}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 h-12 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            {[
              "No credit card required",
              "Setup in 5 minutes",
              "GDPR compliant",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-white/50">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-violet-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Call Card Visual */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md lg:max-w-none">
          <div className="relative w-full max-w-sm">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl scale-110" />

            {/* Main card */}
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-white/40 font-mono">AI RECRUITER AGENT</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>

              {/* Caller info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <HugeiconsIcon icon={AiVoiceIcon} size={28} color="white" />
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-violet-400/40 animate-ping" />
                </div>
                <div>
                  <p className="text-white font-semibold text-base">RecruiterAI Agent</p>
                  <p className="text-white/50 text-sm">Calling Sarah Johnson...</p>
                </div>
              </div>

              {/* Waveform */}
              <div className="flex items-center justify-center gap-1 mb-6 h-12">
                {[3, 6, 9, 12, 8, 14, 10, 6, 11, 7, 13, 9, 5, 10, 8, 12, 6, 9, 4, 7].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-blue-400"
                      style={{
                        height: `${h * 3}px`,
                        animation: `waveBar 1.2s ease-in-out infinite`,
                        animationDelay: `${i * 0.06}s`,
                      }}
                    />
                  )
                )}
              </div>

              {/* Transcript preview */}
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                <p className="text-xs text-white/40 mb-2 font-mono">LIVE TRANSCRIPT</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  &ldquo;Hi Sarah, I&apos;m calling from TechCorp regarding your application for the Senior
                  Engineer role. Do you have a few minutes to chat?&rdquo;
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Duration", value: "2:34" },
                  { label: "Score", value: "87%" },
                  { label: "Status", value: "Active" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
                    <p className="text-white font-semibold text-sm">{stat.value}</p>
                    <p className="text-white/40 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <HugeiconsIcon icon={CallRinging01Icon} size={12} />
              12 calls today
            </div>
            <div className="absolute -bottom-4 -left-4 bg-violet-600/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <HugeiconsIcon icon={AudioWave01Icon} size={12} />
              AI Screening Active
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
