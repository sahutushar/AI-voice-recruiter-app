import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recruiterSettings } from "@/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const FALLBACK_QUESTIONS = [
  "Can you walk me through your experience with the core technologies for this role?",
  "Describe a challenging technical problem you solved and how you approached it.",
  "How do you ensure code quality and maintainability in your projects?",
  "Tell me about a time you had to learn a new technology quickly.",
  "How do you approach debugging a complex production issue?",
  "Describe your experience working in a team and handling disagreements.",
  "What is your approach to performance optimization?",
  "How do you handle tight deadlines and competing priorities?",
];

async function callGeminiWithRetry(prompt: string, retries = 1): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 429 && i < retries) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
  const { role, level, techstack, company, history, questionIndex, totalQuestions, candidateName, agentName: clientAgentName, stylePrompt: clientStylePrompt } =
    await req.json();

  // Use client-provided settings if available (avoids DB round-trip per question)
  let agentName = clientAgentName ?? "Alex";
  let stylePrompt = clientStylePrompt ?? "";
  let customGreeting = "";
  let customClosing = "";

  if (!clientAgentName) {
    const [settings] = await db.select().from(recruiterSettings).limit(1);
    agentName = settings?.agentName ?? "Alex";
    stylePrompt = settings?.questionStylePrompt ?? "";
    customGreeting = settings?.greetingPrompt ?? "";
    customClosing = settings?.closingPrompt ?? "";
  }

  const isGreeting = questionIndex === 0;
  const isClosing = questionIndex >= totalQuestions;

  let prompt = "";

  if (isGreeting) {
    if (customGreeting) {
      // Apply variable substitution on custom greeting
      prompt = customGreeting
        .replace(/{candidateName}/g, candidateName)
        .replace(/{role}/g, role)
        .replace(/{level}/g, level)
        .replace(/{company}/g, company)
        .replace(/{totalQuestions}/g, totalQuestions)
        .replace(/{agentName}/g, agentName);
      return NextResponse.json({ text: prompt });
    }
    prompt = `You are ${agentName}, an AI interviewer for ${company}. Generate a warm, professional greeting for a candidate named ${candidateName} interviewing for the ${level} ${role} position. Keep it to 2-3 sentences. Welcome them, mention the role, and say you'll ask ${totalQuestions} questions. Plain text only, no markdown.`;
  } else if (isClosing) {
    if (customClosing) {
      const text = customClosing
        .replace(/{candidateName}/g, candidateName)
        .replace(/{role}/g, role)
        .replace(/{company}/g, company)
        .replace(/{agentName}/g, agentName);
      return NextResponse.json({ text });
    }
    prompt = `You are ${agentName}, an AI interviewer for ${company}. Generate a professional closing statement for ${candidateName} who just completed their ${level} ${role} interview. Thank them, mention the team will review responses, wish them well. 2-3 sentences. Plain text only.`;
  } else {
    const historyText = history
      .map((h: { role: string; text: string }) =>
        `${h.role === "ai" ? agentName : "Candidate"}: ${h.text}`
      )
      .join("\n");

    prompt = `You are ${agentName}, a professional AI interviewer for a ${level} ${role} at ${company}. Tech stack: ${techstack}.
${stylePrompt ? `\nInterview style instructions: ${stylePrompt}` : ""}

Conversation so far:
${historyText}

Generate ONE concise interview question (question ${questionIndex} of ${totalQuestions}). Mix technical and behavioral. Build on previous answers. 1-2 sentences max. No numbering, no markdown.`;
  }

  try {
    const text = await callGeminiWithRetry(prompt);
    return NextResponse.json({ text });
  } catch {
    let fallback: string;
    if (isGreeting) {
      fallback = `Hello ${candidateName}, welcome to your ${level} ${role} interview at ${company}. I'm ${agentName}, your AI interviewer. I'll be asking you ${totalQuestions} questions today. Let's get started!`;
    } else if (isClosing) {
      fallback = `Thank you ${candidateName} for completing this interview. Your responses have been recorded and our team will review them shortly. Best of luck!`;
    } else {
      fallback = FALLBACK_QUESTIONS[(questionIndex - 1) % FALLBACK_QUESTIONS.length];
    }
    return NextResponse.json({ text: fallback });
  }
}
