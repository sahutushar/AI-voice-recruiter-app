import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

function isRetryable(e: unknown): boolean {
  const msg = String((e as { message?: string })?.message ?? "").toLowerCase();
  const status = (e as { status?: number })?.status;
  return status === 429 || status === 404 ||
    msg.includes("429") || msg.includes("quota") ||
    msg.includes("not found") || msg.includes("404");
}

// Template fallback when Gemini quota is exhausted
function buildTemplate(title: string) {
  const t = title.trim();
  const isEng = /engineer|developer|dev|frontend|backend|fullstack|software/i.test(t);
  const isDesign = /design|ux|ui/i.test(t);
  const isData = /data|analyst|scientist|ml|ai/i.test(t);
  const isManager = /manager|lead|head|director/i.test(t);

  const dept = isEng ? "Engineering" : isDesign ? "Design" : isData ? "Data & Analytics" : isManager ? "Management" : "Operations";
  const skills = isEng
    ? "JavaScript, TypeScript, React, Node.js, Git"
    : isDesign
    ? "Figma, Adobe XD, UI/UX, Prototyping, CSS"
    : isData
    ? "Python, SQL, Pandas, Machine Learning, Tableau"
    : isManager
    ? "Leadership, Agile, Stakeholder Management, Strategy"
    : "Communication, Problem Solving, Project Management";

  return {
    title: t,
    department: dept,
    location: "Remote",
    type: "full-time",
    experience: "3-5 years",
    salary: "$80,000 - $120,000",
    description: `We are looking for a talented ${t} to join our growing team. You will work on challenging problems, collaborate with cross-functional teams, and have a direct impact on our product and customers.`,
    requirements: `- ${3}+ years of relevant experience in ${t.toLowerCase()} or related field\n- Strong problem-solving and communication skills\n- Experience working in an agile environment\n- Bachelor's degree in a relevant field or equivalent experience\n- Ability to work independently and as part of a team`,
    skills,
  };
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const prompt = `Generate a professional job posting for the role: "${title}".
Return ONLY a valid JSON object with no markdown fences or extra text:
{
  "title": "exact job title",
  "department": "relevant department",
  "location": "Remote",
  "type": "full-time",
  "experience": "X-Y years",
  "salary": "$XX,000 - $XX,000",
  "description": "2-3 sentence overview of the role",
  "requirements": "- Requirement 1\n- Requirement 2\n- Requirement 3\n- Requirement 4\n- Requirement 5",
  "skills": "Skill1, Skill2, Skill3, Skill4, Skill5"
}`;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const data = JSON.parse(text);
      return NextResponse.json({ ...data, _source: "ai" });
    } catch (e: unknown) {
      if (isRetryable(e)) continue;
      break;
    }
  }

  // All models failed — return smart template so form still gets filled
  return NextResponse.json({ ...buildTemplate(title), _source: "template" });
}
