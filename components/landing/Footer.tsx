import { AiPhone01Icon, NewTwitterIcon, Linkedin01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const footerLinks = {
  Product: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"],
  Resources: ["Documentation", "API Reference", "Integrations", "Status", "Support"],
};

export default function Footer() {
  return (
    <footer className="bg-[#03030a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <HugeiconsIcon icon={AiPhone01Icon} size={16} color="white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Recruiter<span className="text-violet-400">AI</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered voice agent that automates candidate screening, saving recruiters hours
              every week.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: NewTwitterIcon, label: "Twitter" },
                { icon: Linkedin01Icon, label: "LinkedIn" },
                { icon: Github01Icon, label: "GitHub" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <HugeiconsIcon icon={social.icon} size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white/70 font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/35 text-sm hover:text-white/70 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">
            © {new Date().getFullYear()} RecruiterAI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/25 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
