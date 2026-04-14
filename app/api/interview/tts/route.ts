import { NextRequest, NextResponse } from "next/server";

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("fetch failed after retries");
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const response = await fetchWithRetry("https://api.murf.ai/v1/speech/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.MURF_API_KEY!,
      },
      body: JSON.stringify({
        voiceId: "en-US-falcon",
        style: "Conversational",
        text: text.trim(),
        modelVersion: "GEN2",
        format: "MP3",
        sampleRate: 24000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Murf API error:", response.status, err);
      return NextResponse.json({ error: `Murf error: ${response.status}` }, { status: response.status });
    }

    // Read full audio buffer — client needs complete MP3 for decodeAudioData
    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("TTS route error:", e);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
