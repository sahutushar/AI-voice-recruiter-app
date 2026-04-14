import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const JSON_PROMPT = `Extract candidate information from this resume and return ONLY a valid JSON object with no markdown fences:
{
  "name": "<full name>",
  "email": "<email address or empty string>",
  "phone": "<phone number or empty string>",
  "roleApplied": "<most recent job title or target role>",
  "experience": "<total years of experience e.g. '3 years' or empty string>",
  "skills": "<comma-separated top technical skills>"
}`;

const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash-latest"];

// Send PDF bytes directly to Gemini vision — no pdf-parse needed
async function parseWithGeminiVision(base64: string, mimeType: string): Promise<string> {
  for (const name of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64 } },
        JSON_PROMPT,
      ]);
      return result.response.text().trim();
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 429 || status === 404) continue;
      throw e;
    }
  }
  throw new Error("quota");
}

// Plain-text path for .txt / .docx fallback
async function parseWithGeminiText(text: string): Promise<string> {
  for (const name of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent(`${JSON_PROMPT}\n\nResume:\n${text.slice(0, 6000)}`);
      return result.response.text().trim();
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      if (status === 429 || status === 404) continue;
      throw e;
    }
  }
  throw new Error("quota");
}

function cleanJson(raw: string) {
  return raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
}

// Extract readable text from a PDF buffer without any native dependency.
// PDFs store text in plain ASCII between stream markers — good enough for Gemini.
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const str = buffer.toString("binary");
  const chunks: string[] = [];
  // Grab content between BT (begin text) and ET (end text) markers
  const btEt = /BT[\s\S]*?ET/g;
  let m: RegExpExecArray | null;
  while ((m = btEt.exec(str)) !== null) {
    // Pull out parenthesised strings: (Hello World)
    const parens = /\(([^)]{1,300})\)/g;
    let p: RegExpExecArray | null;
    while ((p = parens.exec(m[0])) !== null) {
      const t = p[1].replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\\\/g, "\\");
      if (t.trim().length > 1) chunks.push(t);
    }
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let raw: string | null = null;
    let fallbackText = "";

    if (fileName.endsWith(".pdf")) {
      // 1st attempt: Gemini vision reads the PDF natively
      try {
        raw = await parseWithGeminiVision(buffer.toString("base64"), "application/pdf");
      } catch {
        // Vision quota hit — extract text from PDF bytes and try text endpoint
        fallbackText = extractTextFromPdfBuffer(buffer);
        if (fallbackText.length >= 30) {
          try {
            raw = await parseWithGeminiText(fallbackText);
          } catch { /* both quota exhausted — fall through to partial result */ }
        }
      }
    } else {
      fallbackText = buffer
        .toString("utf-8")
        .replace(/<[^>]+>/g, " ")
        .replace(/[^\x20-\x7E\n\r]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!fallbackText || fallbackText.length < 30) {
        return NextResponse.json(
          { error: "Could not extract text from this file. Please upload a PDF or .txt file." },
          { status: 400 }
        );
      }
      try {
        raw = await parseWithGeminiText(fallbackText);
      } catch { /* quota — fall through */ }
    }

    // If Gemini succeeded, return parsed JSON
    if (raw) {
      const parsed = JSON.parse(cleanJson(raw));
      return NextResponse.json({
        name:        parsed.name        ?? "",
        email:       parsed.email       ?? "",
        phone:       parsed.phone       ?? "",
        roleApplied: parsed.roleApplied ?? "",
        experience:  parsed.experience  ?? "",
        skills:      parsed.skills      ?? "",
      });
    }

    // Gemini quota exhausted on all models — do best-effort regex extraction
    // so the form is at least partially filled rather than showing an error
    const text = fallbackText || buffer.toString("utf-8");
    const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
    const nameMatch  = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);

    return NextResponse.json({
      name:        nameMatch?.[1]  ?? "",
      email:       emailMatch?.[0] ?? "",
      phone:       phoneMatch?.[1]?.trim() ?? "",
      roleApplied: "",
      experience:  "",
      skills:      "",
      _partial: true,
      _warning: "AI quota exhausted — basic fields extracted. Please fill in Role and Skills manually.",
    });

  } catch (e) {
    console.error("[parse-resume] Error:", e);
    return NextResponse.json({ error: "Failed to parse resume. Please enter details manually." }, { status: 500 });
  }
}
