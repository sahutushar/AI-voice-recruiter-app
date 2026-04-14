"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AiPhone01Icon, Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleSignIn = () => router.push(isSignedIn ? "/dashboard" : "/sign-in");
  const handleGetStarted = () => router.push(isSignedIn ? "/dashboard" : "/sign-up");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#05050f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <HugeiconsIcon icon={AiPhone01Icon} size={16} color="white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Recruiter<span className="text-violet-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/25"
                >
                  Dashboard
                </Button>
                <UserButton />
              </>
            ) : (
              <>
                <Button onClick={handleSignIn} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
                <Button onClick={handleGetStarted} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/25">
                  Get Started Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#05050f]/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-4">
          {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Button onClick={() => router.push("/dashboard")} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0 flex-1">
                Dashboard
              </Button>
              <UserButton />
            </div>
          ) : (
            <>
              <Button onClick={handleSignIn} variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 w-full">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0 w-full">
                Get Started Free
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
