import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { recruiterSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "@/components/dashboard/settings/SettingsClient";

const DEFAULTS = {
  companyName: "RecruiterAI",
  companyIndustry: "",
  companyWebsite: "",
  recruiterEmail: "",
  agentName: "Alex",
  questionsScreening: 5,
  questionsTechnical: 8,
  questionsHrFinal: 6,
  silenceTimeoutMs: 2000,
  maxListenMs: 45000,
  greetingPrompt: "",
  questionStylePrompt: "",
  closingPrompt: "",
  minHireScore: 70,
  technicalWeight: 60,
  communicationWeight: 40,
  notifyOnInvite: "true",
  notifyOnComplete: "true",
};

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [existing] = await db
    .select()
    .from(recruiterSettings)
    .where(eq(recruiterSettings.clerkId, user.id));

  const settings = existing
    ? {
        companyName: existing.companyName ?? DEFAULTS.companyName,
        companyIndustry: existing.companyIndustry ?? "",
        companyWebsite: existing.companyWebsite ?? "",
        recruiterEmail: existing.recruiterEmail ?? "",
        agentName: existing.agentName ?? DEFAULTS.agentName,
        questionsScreening: existing.questionsScreening ?? DEFAULTS.questionsScreening,
        questionsTechnical: existing.questionsTechnical ?? DEFAULTS.questionsTechnical,
        questionsHrFinal: existing.questionsHrFinal ?? DEFAULTS.questionsHrFinal,
        silenceTimeoutMs: existing.silenceTimeoutMs ?? DEFAULTS.silenceTimeoutMs,
        maxListenMs: existing.maxListenMs ?? DEFAULTS.maxListenMs,
        greetingPrompt: existing.greetingPrompt ?? "",
        questionStylePrompt: existing.questionStylePrompt ?? "",
        closingPrompt: existing.closingPrompt ?? "",
        minHireScore: existing.minHireScore ?? DEFAULTS.minHireScore,
        technicalWeight: existing.technicalWeight ?? DEFAULTS.technicalWeight,
        communicationWeight: existing.communicationWeight ?? DEFAULTS.communicationWeight,
        notifyOnInvite: existing.notifyOnInvite ?? "true",
        notifyOnComplete: existing.notifyOnComplete ?? "true",
      }
    : DEFAULTS;

  return <SettingsClient settings={settings} defaults={DEFAULTS} />;
}
