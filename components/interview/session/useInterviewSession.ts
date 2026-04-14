"use client";

import { useEffect, useRef, useState } from "react";

export type MessageRole = "ai" | "user";
export interface ChatMessage {
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export interface InterviewSummary {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  sessionId: number;
}

export type SessionStatus =
  | "idle"
  | "requesting-permissions"
  | "greeting"
  | "ai-speaking"
  | "listening"
  | "processing"
  | "closing"
  | "ended";

export interface InterviewDetails {
  interviewId: string;
  role: string;
  level: string;
  techstack: string;
  company: string;
  candidateName: string;
}

const DEFAULT_QUESTIONS = 5;

const FALLBACK_QUESTIONS = [
  "Can you walk me through your experience with the core technologies for this role?",
  "Describe a challenging technical problem you solved and how you approached it.",
  "How do you ensure code quality and maintainability in your projects?",
  "Tell me about a time you had to learn a new technology quickly.",
  "How do you approach debugging a complex production issue?",
  "Describe your experience working in a team and handling disagreements.",
  "What is your approach to performance optimization?",
];

export function useInterviewSession(details: InterviewDetails) {
  const [status, setStatus]               = useState<SessionStatus>("idle");
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isMuted, setIsMuted]             = useState(false);
  const [isCameraOff, setIsCameraOff]     = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [stream, setStream]               = useState<MediaStream | null>(null);
  const [summary, setSummary]             = useState<InterviewSummary | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);

  const streamRef      = useRef<MediaStream | null>(null);
  const messagesRef    = useRef<ChatMessage[]>([]);
  const isMutedRef     = useRef(false);
  const isEndedRef     = useRef(false);
  const isStartedRef   = useRef(false);
  const detailsRef     = useRef(details);
  detailsRef.current   = details;
  const agentNameRef   = useRef("Alex");
  const stylePromptRef = useRef("");

  const startSession = () => {
    if (isStartedRef.current) return;
    isStartedRef.current = true;
    isEndedRef.current   = false;
    messagesRef.current  = [];
    setMessages([]);
    setSummary(null);
    setQuestionIndex(0);
    setCurrentTranscript("");
    setStatus("requesting-permissions");

    // ── helpers ──────────────────────────────────────────────────────────────

    const addMsg = (role: MessageRole, text: string) => {
      const msg: ChatMessage = { role, text, timestamp: new Date() };
      messagesRef.current = [...messagesRef.current, msg];
      setMessages(prev => [...prev, msg]);
    };

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    // ── TTS ──────────────────────────────────────────────────────────────────
    // Murf AI via /api/interview/tts, falls back to speechSynthesis on error
    const speakWithSynthesis = (text: string): Promise<void> =>
      new Promise(resolve => {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "en-US"; utt.rate = 0.95; utt.pitch = 1; utt.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
          v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
        ) || voices.find(v => v.lang.startsWith("en"));
        if (preferred) utt.voice = preferred;
        let done = false;
        const finish = () => { if (done) return; done = true; setIsAgentSpeaking(false); resolve(); };
        utt.onend = finish; utt.onerror = finish;
        setTimeout(finish, Math.max(5000, text.split(" ").length * 400));
        window.speechSynthesis.speak(utt);
      });

    const speak = (text: string): Promise<void> =>
      new Promise(async resolve => {
        if (isEndedRef.current) { resolve(); return; }
        setIsAgentSpeaking(true);
        try {
          const res = await fetch("/api/interview/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) throw new Error("tts failed");
          const arrayBuffer = await res.arrayBuffer();
          const audioCtx = new AudioContext();
          let ctxClosed = false;
          const closeCtx = () => { if (!ctxClosed) { ctxClosed = true; audioCtx.close().catch(() => {}); } };
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const source = audioCtx.createBufferSource();
          source.buffer = decoded;
          source.connect(audioCtx.destination);
          let done = false;
          const finish = () => { if (done) return; done = true; setIsAgentSpeaking(false); closeCtx(); resolve(); };
          source.onended = finish;
          source.start(0);
          // Safety timeout
          setTimeout(finish, Math.max(10000, text.split(" ").length * 500));
        } catch {
          // Fallback to browser TTS
          await speakWithSynthesis(text);
          resolve();
        }
      });

    // ── Question generation ───────────────────────────────────────────────────
    // Pre-fetched batch: greeting + all questions + closing in one Gemini call
    type QuestionBank = { greeting: string; questions: string[]; closing: string } | null;
    const questionBankRef = { current: null as QuestionBank };

    const prefetchQuestions = async (tq: number): Promise<void> => {
      const d = detailsRef.current;
      try {
        const res = await fetch("/api/interview/generate-all-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: d.role, level: d.level, techstack: d.techstack,
            company: d.company, candidateName: d.candidateName,
            totalQuestions: tq, agentName: agentNameRef.current,
          }),
        });
        if (res.ok) questionBankRef.current = await res.json();
      } catch { /* fall through to per-question generation */ }
    };

    const getQuestion = async (index: number, tq: number): Promise<string> => {
      const d = detailsRef.current;
      // Use pre-fetched bank if available
      const bank = questionBankRef.current;
      if (bank) {
        if (index === 0) return bank.greeting;
        if (index > tq)  return bank.closing;
        return bank.questions[index - 1] ?? FALLBACK_QUESTIONS[(index - 1) % FALLBACK_QUESTIONS.length];
      }
      // Per-question fallback (dynamic, history-aware)
      try {
        const res = await fetch("/api/interview/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...d,
            history: messagesRef.current.map(m => ({ role: m.role, text: m.text })),
            questionIndex: index,
            totalQuestions: tq,
            agentName: agentNameRef.current,
            stylePrompt: stylePromptRef.current,
          }),
        });
        const data = await res.json();
        if (data.text) return data.text as string;
        throw new Error("empty");
      } catch {
        if (index === 0) return `Hello ${d.candidateName}, welcome to your ${d.level} ${d.role} interview at ${d.company}. I will ask you ${tq} questions. Let us begin!`;
        if (index > tq)  return `Thank you ${d.candidateName}, that concludes your interview. We will review your responses and be in touch soon!`;
        return FALLBACK_QUESTIONS[(index - 1) % FALLBACK_QUESTIONS.length];
      }
    };

    // ── Speech recognition ────────────────────────────────────────────────────
    // Simple, reliable approach:
    // 1. continuous=true so Chrome never auto-stops mid-sentence
    // 2. Silence timer resets on every onresult event
    // 3. After 3s of silence following speech → finish
    // 4. If no speech at all after 60s → finish with empty
    const listen = (): Promise<string> =>
      new Promise(resolve => {
        if (isEndedRef.current) { resolve(""); return; }
        if (isMutedRef.current) { resolve(""); return; }

        type SpeechRecognitionAlternative = { transcript: string; confidence: number };
        type SpeechRecognitionResult = { isFinal: boolean; [index: number]: SpeechRecognitionAlternative; length: number };
        type SpeechRecognitionResultList = { [index: number]: SpeechRecognitionResult; length: number; resultIndex: number };
        type SREvent = { results: SpeechRecognitionResultList; resultIndex: number };
        type SRErrorEvent = { error: string };
        type SpeechRecognitionCtor = new () => {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          maxAlternatives: number;
          start(): void;
          stop(): void;
          onresult: ((e: SREvent) => void) | null;
          onerror: ((e: SRErrorEvent) => void) | null;
          onend: (() => void) | null;
        };
        const SR: SpeechRecognitionCtor | undefined =
          (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

        if (!SR) { resolve("Speech recognition not supported. Please use Chrome."); return; }

        let finalText    = "";
        let interimText  = "";
        let done         = false;
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;
        let noSpeechTimer: ReturnType<typeof setTimeout> | null = null;

        const rec = new SR();
        rec.continuous      = true;   // keep listening — don't auto-stop
        rec.interimResults  = true;
        rec.lang            = "en-US";
        rec.maxAlternatives = 1;

        const finish = (result: string) => {
          if (done) return;
          done = true;
          if (silenceTimer)   clearTimeout(silenceTimer);
          if (noSpeechTimer)  clearTimeout(noSpeechTimer);
          setCurrentTranscript("");
          try { rec.stop(); } catch { /* ok */ }
          resolve(result.trim());
        };

        rec.onresult = (e: SREvent) => {
          // Cancel no-speech timeout once candidate starts talking
          if (noSpeechTimer) { clearTimeout(noSpeechTimer); noSpeechTimer = null; }
          // Reset silence timer on every speech chunk
          if (silenceTimer) clearTimeout(silenceTimer);

          interimText = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              finalText  += e.results[i][0].transcript + " ";
              interimText = "";
            } else {
              interimText = e.results[i][0].transcript;
            }
          }
          setCurrentTranscript(finalText + interimText);

          // 3 seconds of silence after last speech → submit answer
          silenceTimer = setTimeout(() => finish(finalText), 3000);
        };

        rec.onerror = (e: SRErrorEvent) => {
          if (done) return;
          if (e.error === "aborted") return;
          if (e.error === "not-allowed") { finish(""); return; }
          // For other errors (no-speech, network) — just keep going, onresult will fire when they speak
        };

        rec.onend = () => {
          // continuous=true should not fire onend unless we called stop()
          // If it fires unexpectedly and we're not done, restart
          if (!done) {
            try { rec.start(); } catch { finish(finalText); }
          }
        };

        // If candidate says nothing for 60 seconds, move on
        noSpeechTimer = setTimeout(() => finish(finalText), 60000);

        try {
          rec.start();
        } catch {
          finish("");
        }
      });

    // ── Save + analyze ────────────────────────────────────────────────────────
    const complete = async (msgs: ChatMessage[], completionStatus: string) => {
      const d = detailsRef.current;
      try {
        const res = await fetch("/api/interview/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewId:   d.interviewId,
            candidateName: d.candidateName,
            transcript:    msgs.map(m => ({ role: m.role, text: m.text })),
            role: d.role, level: d.level, techstack: d.techstack,
            company: d.company, status: completionStatus,
          }),
        });
        const data = await res.json();
        if (data.success) setSummary({ ...data.analysis, sessionId: data.sessionId });
      } catch (e) {
        console.error("complete error:", e);
      }
    };

    // ── Main interview loop ───────────────────────────────────────────────────
    const runStep = async (index: number, tq: number): Promise<void> => {
      if (isEndedRef.current) return;

      const isClosing = index > tq;
      setStatus(index === 0 ? "greeting" : isClosing ? "closing" : "ai-speaking");
      setQuestionIndex(index);

      // Get question text
      const text = await getQuestion(index, tq);
      addMsg("ai", text);

      // Speak it
      await speak(text);
      // Small gap after speaking before mic opens
      await wait(500);

      if (isClosing || isEndedRef.current) {
        setStatus("ended");
        await complete(messagesRef.current, "completed");
        return;
      }

      // Listen for answer
      setStatus("listening");
      const response = await listen();
      if (isEndedRef.current) return;

      // Save answer (even if empty)
      addMsg("user", response || "(no response)");
      setStatus("processing");
      await wait(300);

      await runStep(index + 1, tq);
    };

    // ── Boot ─────────────────────────────────────────────────────────────────
    (async () => {
      try {
        // 1. Get camera + mic — this triggers the browser permission popup
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        setStream(mediaStream);

        // 2. Load settings
        let qCount = DEFAULT_QUESTIONS;
        try {
          const res = await fetch("/api/settings");
          if (res.ok) {
            const s = await res.json();
            if (s) {
              const prefix = detailsRef.current.interviewId.split("-")[0];
              qCount =
                prefix === "TEC" ? (s.questionsTechnical ?? DEFAULT_QUESTIONS)
                : prefix === "HRF" ? (s.questionsHrFinal ?? DEFAULT_QUESTIONS)
                : (s.questionsScreening ?? DEFAULT_QUESTIONS);
              setTotalQuestions(qCount);
              agentNameRef.current   = s.agentName ?? "Alex";
              stylePromptRef.current = s.questionStylePrompt ?? "";
            }
          }
        } catch { /* use defaults */ }

        // 3. Pre-fetch all questions in one Gemini call
        await prefetchQuestions(qCount);

        // 4. Start interview
        await runStep(0, qCount);
      } catch (e) {
        console.error("Session error:", e);
        isStartedRef.current = false;
        setStatus("idle");
      }
    })();
  };

  // ── Controls ─────────────────────────────────────────────────────────────

  const toggleMute = () => {
    isMutedRef.current = !isMutedRef.current;
    setIsMuted(isMutedRef.current);
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !isMutedRef.current; });
  };

  const toggleCamera = () => {
    const off = !isCameraOff;
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !off; });
    setIsCameraOff(off);
  };

  const endCall = () => {
    isEndedRef.current = true;
    window.speechSynthesis?.cancel();
    // Stop any playing Murf audio by closing all AudioContexts (best-effort)
    try { (window as unknown as { _murfCtx?: AudioContext })._murfCtx?.close(); } catch { /* ok */ }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStatus("ended");
    const d = detailsRef.current;
    fetch("/api/interview/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewId: d.interviewId, candidateName: d.candidateName,
        transcript: messagesRef.current.map(m => ({ role: m.role, text: m.text })),
        role: d.role, level: d.level, techstack: d.techstack,
        company: d.company, status: "incomplete",
      }),
    })
      .then(r => r.json())
      .then(data => { if (data.success) setSummary({ ...data.analysis, sessionId: data.sessionId }); })
      .catch(() => {});
  };

  useEffect(() => {
    return () => {
      isEndedRef.current   = true;
      isStartedRef.current = false;
      window.speechSynthesis?.cancel();
      try { (window as unknown as { _murfCtx?: AudioContext })._murfCtx?.close(); } catch { /* ok */ }
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  return {
    status, messages, isAgentSpeaking, isMuted, isCameraOff,
    currentTranscript, stream, summary, startSession,
    toggleMute, toggleCamera, endCall, questionIndex, totalQuestions,
  };
}
