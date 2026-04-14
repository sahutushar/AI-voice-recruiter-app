"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight01Icon, AiPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CTA() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => router.push(isSignedIn ? "/dashboard" : "/sign-up");
  const handleDemo = () => router.push(isSignedIn ? "/dashboard" : "/sign-in");
  return (
    <section className="py-24 bg-[#05050f] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 mb-8 shadow-2xl shadow-violet-500/40">
          <HugeiconsIcon icon={AiPhone01Icon} size={32} color="white" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to Automate{" "}
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Your Hiring?
          </span>
        </h2>

        <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Join 500+ companies saving hours every week. Import your first candidate list today and
          watch RecruiterAI handle the rest — calls, screening, scoring, and scheduling.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-2xl shadow-violet-500/40 text-base px-10 h-13"
          >
            Start Free Trial — No Card Needed
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
          </Button>
          <Button
            size="lg"
            onClick={handleDemo}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 h-13 bg-transparent"
          >
            Book a Demo
          </Button>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-white/25 text-sm">
          14-day free trial · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}
