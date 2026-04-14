import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckmarkCircle01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small teams just getting started with AI screening.",
    features: [
      "Up to 50 calls/month",
      "Basic AI screening",
      "Email reports",
      "CSV import",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/month",
    description: "For growing teams that need powerful automation and integrations.",
    features: [
      "Up to 500 calls/month",
      "Advanced AI with custom questions",
      "Detailed scoring & transcripts",
      "ATS integrations (Greenhouse, Lever)",
      "Auto interview scheduling",
      "Multi-language support",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with high-volume hiring needs.",
    features: [
      "Unlimited calls",
      "Custom AI voice & persona",
      "White-label option",
      "SSO & advanced security",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#07070f] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-violet-600/20 to-blue-600/10 border-violet-500/40 shadow-2xl shadow-violet-500/20 scale-105"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-violet-600 to-blue-600 text-white border-0 px-4 py-1 text-xs font-semibold shadow-lg">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    plan.highlighted ? "text-violet-300" : "text-white/70"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-white/45 text-sm leading-relaxed">{plan.description}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "text-violet-400" : "text-emerald-400"
                      }`}
                    />
                    <span className="text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full h-11 font-semibold ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-violet-500/30"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30"
                }`}
              >
                {plan.cta}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/30 text-sm mt-10">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
