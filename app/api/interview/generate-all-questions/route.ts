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

// Generates ALL questions in ONE Gemini call instead of one call per question
export async function POST(req: NextRequest) {
  const { role, level, techstack, company, candidateName, totalQuestions, agentName: clientAgentName } =
    await req.json();

  let agentName = clientAgentName ?? "Alex";
  try {
    const [settings] = await db.select().from(recruiterSettings).limit(1);
    if (settings?.agentName) agentName = settings.agentName;
  } catch { /* use default */ }

  const greeting = `Hello ${candidateName}, welcome to your ${level} ${role} interview at ${company}. I'm ${agentName}, your AI interviewer. I'll be asking you ${totalQuestions} questions today. Let's get started!`;
  const closing  = `Thank you ${candidateName} for completing this interview. Your responses have been recorded and our team will review them shortly. Best of luck!`;

  const prompt = `You are ${agentName}, a professional AI interviewer conducting a ${level} ${role} interview at ${company}.
Tech stack: ${techstack}.

Generate exactly ${totalQuestions} interview questions. Mix technical and behavioral. Each question must be 1-2 sentences max. Be specific to the role and tech stack.

Return ONLY a valid JSON array of strings, no markdown, no numbering:
["question 1", "question 2", "question ${totalQuestions}"]`;

  try {
    const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const questions: string[] = JSON.parse(raw);
    if (!Array.isArray(questions) || questions.length === 0) throw new Error("bad");
    while (questions.length < totalQuestions) {
      questions.push(FALLBACK_QUESTIONS[questions.length % FALLBACK_QUESTIONS.length]);
    }
    return NextResponse.json({ greeting, questions: questions.slice(0, totalQuestions), closing });
  } catch {
    const questions = Array.from({ length: totalQuestions }, (_, i) =>
      FALLBACK_QUESTIONS[i % FALLBACK_QUESTIONS.length]
    );
    return NextResponse.json({ greeting, questions, closing });
  }
}
