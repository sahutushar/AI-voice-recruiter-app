# RecruiterAI — AI-Powered Voice Interview Platform

> End-to-end AI recruiting platform that automates the entire hiring pipeline — from job posting to final hire recommendation — using real-time voice interviews powered by Google Gemini, Murf AI TTS, and the Web Speech API.

---

## STAR Overview

### Situation
Hiring teams waste hundreds of hours on repetitive first-round screening calls, manual resume parsing, and chasing candidates for scheduling. There was no unified platform that could handle job creation, candidate matching, interview delivery, and post-interview analysis in a single automated workflow.

### Task
Build a production-grade, multi-tenant AI recruiting platform that:
- Auto-generates job descriptions from a title
- Matches candidates to jobs using AI scoring
- Delivers real-time voice interviews via an AI agent
- Analyzes transcripts and produces structured hire/maybe/no recommendations
- Notifies recruiters automatically via email

### Action
Architected and built a full-stack Next.js 16 application with:
- Google Gemini for all LLM tasks (job generation, candidate matching, question generation, transcript analysis)
- Murf AI GEN2 TTS (`en-US-falcon`) for natural AI voice delivery, with browser `SpeechSynthesis` fallback
- Web Speech API for real-time candidate speech-to-text with silence detection
- Neon serverless PostgreSQL + Drizzle ORM for the data layer
- Clerk for auth and multi-tenancy
- Resend for candidate interview invitations
- Plunk for recruiter result notifications

### Result
A fully automated recruiting pipeline where a recruiter can go from zero to a structured interview report with a hire recommendation in minutes, with zero manual scheduling or screening calls required.

---

## Full Pipeline

```
Recruiter creates job posting
        ↓
Gemini auto-generates job description, requirements, skills, salary
        ↓
Gemini scores and ranks candidates from the candidate pool (skill overlap + role alignment)
        ↓
Recruiter selects top matches → bulk email invitations sent via Resend
        ↓
Candidate receives email with unique interview link
        ↓
Candidate joins voice interview session (camera + mic permissions)
        ↓
Settings loaded: question count, agent name, scoring weights
        ↓
All questions pre-fetched in one Gemini call (greeting + N questions + closing)
        ↓
AI agent speaks each question via Murf TTS (AudioContext + MP3 stream)
        ↓
Candidate answers via browser microphone (Web Speech API, continuous mode)
        ↓
3-second silence detection → answer captured → next question
        ↓
Full transcript saved to Neon DB (interview_sessions)
        ↓
Gemini analyzes transcript → overall score, technical score, communication score,
strengths, weaknesses, summary, hire/maybe/no recommendation
        ↓
Analysis saved to interview_summaries table
        ↓
Recruiter receives email notification via Plunk with score + recommendation + report link
        ↓
Recruiter views full structured report in dashboard
```

---

## Features

| Feature | Description |
|---|---|
| AI Job Generation | Paste a job title → Gemini fills the full description, requirements, skills, salary, department |
| Candidate Management | Add candidates with resume PDF upload (parsed to text), skills, experience, status tracking |
| AI Candidate Matching | Gemini scores candidates against a job by skill overlap and role alignment (max 5 ranked results) |
| Fallback Scoring | If Gemini quota is exhausted, a deterministic skill-overlap algorithm scores candidates locally |
| Interview Invitations | Bulk email invites via Resend with branded HTML email and unique interview link per candidate |
| Real-Time Voice Interview | AI speaks questions via Murf TTS; candidate responds via browser microphone |
| TTS Fallback | If Murf API fails, falls back to browser `SpeechSynthesisUtterance` automatically |
| Silence Detection | 3-second silence timer after last speech chunk → answer submitted; 60-second no-speech timeout |
| Transcript Analysis | Full conversation analyzed by Gemini for technical and communication scores |
| Structured Report | Overall score (0–100), technical score, communication score, strengths, weaknesses, written summary |
| Hire Recommendation | `hire` / `maybe` / `no` decision emailed to recruiter via Plunk |
| Configurable AI Agent | Customize agent name, question counts per interview type, scoring weights, notification preferences |
| Multi-model Fallback | Gemini model cascade: `gemini-2.0-flash-lite` → `gemini-2.0-flash` → `gemini-1.5-flash` on quota errors |
| Auth & Multi-tenancy | Clerk handles sign-up, sign-in, session management, and user sync via webhook |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| Language | TypeScript | ^5 |
| Auth | Clerk | ^7.0.12 |
| Database | Neon (PostgreSQL, serverless) | ^1.0.2 |
| ORM | Drizzle ORM | ^0.45.2 |
| AI / LLM | Google Gemini | ^0.24.1 |
| Text-to-Speech | Murf AI (`en-US-falcon`, GEN2) | REST API |
| Speech-to-Text | Web Speech API | Browser-native |
| Email (invites) | Resend | ^6.11.0 |
| Email (notifications) | Plunk | REST API |
| UI Components | shadcn/ui + Radix UI | ^1.4.3 |
| Styling | Tailwind CSS | ^4 |
| Charts | Recharts | ^3.8.0 |
| PDF Parsing | pdf-parse | ^2.4.5 |
| Deployment | Vercel | — |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  (auth)/     │  │  (dashboard)/    │  │  interview/      │  │
│  │  Clerk UI    │  │  Protected       │  │  [interviewId]/  │  │
│  │  sign-in     │  │  recruiter       │  │  Public voice    │  │
│  │  sign-up     │  │  dashboard       │  │  session page    │  │
│  └──────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Routes                          │   │
│  │                                                          │   │
│  │  /api/jobs/generate          → Gemini job description    │   │
│  │  /api/jobs/[id]/match        → Gemini candidate scoring  │   │
│  │  /api/jobs/[id]/send-invites → Resend bulk email         │   │
│  │  /api/candidates/parse-resume→ pdf-parse text extract    │   │
│  │  /api/interview/generate-all-questions → Gemini batch    │   │
│  │  /api/interview/tts          → Murf AI audio proxy       │   │
│  │  /api/interview/complete     → Save + Gemini analysis    │   │
│  │  /api/settings               → Recruiter config CRUD     │   │
│  │  /api/webhooks/clerk         → User sync (Svix)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       Neon PostgreSQL   Google Gemini    Murf AI TTS
       (Drizzle ORM)     (LLM tasks)     (Voice synthesis)
              │
    ┌─────────┴──────────┐
    │   Resend (invites)  │
    │   Plunk (notify)    │
    └────────────────────┘
```

---

## Project Structure

```
app/
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx     # Clerk sign-in
│   └── sign-up/[[...sign-up]]/page.tsx     # Clerk sign-up
├── (dashboard)/
│   └── dashboard/
│       ├── page.tsx                         # Dashboard home
│       ├── jobs/page.tsx                    # Job postings management
│       ├── candidates/
│       │   ├── page.tsx                     # Candidate list
│       │   └── [sessionId]/                 # Interview report detail
│       ├── interviews/page.tsx              # Interview sessions list
│       └── settings/page.tsx               # AI agent & notification config
├── interview/
│   └── [interviewId]/
│       ├── page.tsx                         # Interview join/info page
│       └── session/page.tsx                 # Live voice interview session
└── api/
    ├── jobs/
    │   ├── route.ts                         # GET/POST job postings
    │   ├── generate/route.ts                # POST — AI job description
    │   └── [id]/
    │       ├── route.ts                     # GET/PATCH/DELETE job
    │       ├── match-candidates/route.ts    # POST — AI candidate matching
    │       └── send-invites/route.ts        # POST — bulk email invitations
    ├── candidates/
    │   ├── route.ts                         # GET/POST candidates
    │   ├── parse-resume/route.ts            # POST — PDF text extraction
    │   └── [id]/route.ts                    # GET/PATCH/DELETE candidate
    ├── interview/
    │   ├── generate-all-questions/route.ts  # POST — batch question generation
    │   ├── generate-question/route.ts       # POST — single question (fallback)
    │   ├── tts/route.ts                     # POST — Murf TTS audio proxy
    │   └── complete/route.ts                # POST — save transcript + analysis
    ├── job-invites/route.ts                 # GET/POST interview invites
    ├── settings/route.ts                    # GET/POST recruiter settings
    └── webhooks/clerk/route.ts              # Clerk user sync webhook

components/
├── dashboard/
│   ├── AppSidebar.tsx                       # Navigation sidebar
│   ├── DashboardHeader.tsx                  # Top header bar
│   ├── jobs/
│   │   ├── JobsClient.tsx                   # Jobs list + actions
│   │   ├── AddJobDialog.tsx                 # Create job with AI generation
│   │   └── MatchAndInviteDialog.tsx         # Match candidates + send invites
│   ├── candidates/
│   │   ├── CandidatesClient.tsx             # Candidates list + reports
│   │   └── AddCandidateDialog.tsx           # Add candidate + resume upload
│   ├── interviews/
│   │   └── InterviewsClient.tsx             # Interview sessions list
│   └── settings/
│       └── SettingsClient.tsx               # AI agent + notification config
├── interview/
│   ├── InterviewHeader.tsx                  # Interview page header
│   ├── InterviewJoinForm.tsx                # Pre-interview name entry form
│   └── session/
│       ├── InterviewSession.tsx             # Main session orchestrator
│       ├── useInterviewSession.ts           # Core interview state + logic hook
│       ├── AgentAvatar.tsx                  # Animated AI agent avatar
│       ├── CallControls.tsx                 # Mute / camera / end call buttons
│       ├── ChatPanel.tsx                    # Live transcript chat panel
│       └── WebcamView.tsx                   # Candidate webcam feed
├── landing/                                 # Marketing landing page sections
└── ui/                                      # shadcn/ui primitives (50+ components)

db/
├── schema.ts                                # Drizzle table definitions
└── index.ts                                 # Neon DB connection
```

---

## Database Schema

```
users
├── id (serial PK)
├── clerkId (unique)
├── name
├── email (unique)
└── createdAt

jobs
├── id (serial PK)
├── title, department, location, type
├── experience, salary
├── description, requirements, skills
├── status (draft | active | expired)
└── createdAt

candidates
├── id (serial PK)
├── name, email, phone
├── roleApplied, experience
├── skills (comma-separated)
├── resumeText (extracted PDF text)
├── status (new | screening | interview | hired | rejected)
├── notes
└── createdAt

job_invites
├── id (serial PK)
├── jobId → jobs.id
├── candidateId → candidates.id
├── status (pending | completed | expired)
├── interviewLink (unique token)
└── createdAt

interview_sessions
├── id (serial PK)
├── interviewId (matches interviewLink)
├── jobId → jobs.id
├── candidateName
├── transcript (JSON stringified ChatMessage[])
├── status (completed | incomplete)
├── role, level, techstack, company
└── createdAt

interview_summaries
├── id (serial PK)
├── sessionId → interview_sessions.id (unique)
├── overallScore (0–100)
├── technicalScore (0–100)
├── communicationScore (0–100)
├── recommendation (hire | maybe | no)
├── strengths (JSON string[])
├── weaknesses (JSON string[])
├── summary (paragraph)
└── createdAt

recruiter_settings
├── id (serial PK)
├── clerkId (unique)
├── companyName, companyIndustry, companyWebsite, recruiterEmail
├── agentName, questionsScreening, questionsTechnical, questionsHrFinal
├── silenceTimeoutMs, maxListenMs
├── greetingPrompt, questionStylePrompt, closingPrompt
├── minHireScore, technicalWeight, communicationWeight
├── notifyOnInvite, notifyOnComplete
└── updatedAt
```

---

## Interview Session — How It Works Technically

The core logic lives in `useInterviewSession.ts`. Here is the exact execution order when a candidate starts a session:

```
1. navigator.mediaDevices.getUserMedia({ video: true, audio: true })
   → Camera + mic permissions granted → MediaStream stored in ref

2. GET /api/settings
   → Load question count (screening=5, technical=8, hr-final=6), agent name, style prompt

3. POST /api/interview/generate-all-questions
   → Single Gemini call returns: { greeting, questions[N], closing }
   → Entire question bank cached in memory (questionBankRef)

4. Interview loop: runStep(index, totalQuestions)
   ├── index === 0  → speak greeting
   ├── index 1..N  → speak question[index-1]
   └── index > N   → speak closing → POST /api/interview/complete → end

5. For each question:
   a. speak(text)
      → POST /api/interview/tts → Murf API → MP3 ArrayBuffer
      → AudioContext.decodeAudioData → BufferSource.start()
      → On error: SpeechSynthesisUtterance fallback
   b. listen()
      → SpeechRecognition({ continuous: true, interimResults: true })
      → onresult: accumulate finalText, reset 3s silence timer
      → After 3s silence: resolve(finalText)
      → After 60s no speech: resolve("")
   c. addMsg("user", response) → append to messagesRef + state

6. POST /api/interview/complete
   → Save interview_sessions row (transcript as JSON)
   → Gemini analyzes transcript → scores + recommendation
   → Save interview_summaries row
   → Mark job_invite as completed
   → Fire-and-forget: POST Plunk notification to recruiter email
```

---

## AI Models Used

| Task | Model | Fallback |
|---|---|---|
| Job description generation | `gemini-2.0-flash-lite` | `gemini-2.0-flash` → `gemini-1.5-flash` → template |
| Candidate matching | `gemini-2.0-flash-lite` | `gemini-2.0-flash` → `gemini-1.5-flash` → local scoring |
| Interview question generation | `gemini-2.0-flash-lite` | hardcoded fallback questions |
| Transcript analysis | `gemini-2.0-flash-lite` | score-from-answer-count fallback |

All Gemini calls strip markdown fences from responses before `JSON.parse`.

---

## Interview Types

| Type | Default Questions | Interview Link Prefix |
|---|---|---|
| AI Screening | 5 | `SCR-` |
| Tech Interview | 8 | `TEC-` |
| HR Final Round | 6 | `HRF-` |

All counts are configurable per recruiter in Settings.

---

## Email Flows

### Candidate Invitation (Resend)
- Triggered by recruiter clicking "Send Invites" in the Match & Invite dialog
- Branded HTML email with interview details and a "Start Interview" CTA button
- Unique interview URL: `{APP_URL}/interview/{interviewLink}`
- From: `RecruiterAI <onboarding@resend.dev>`

### Recruiter Notification (Plunk)
- Triggered after interview completion (fire-and-forget, never blocks the main flow)
- Contains: candidate name, position, overall score, recommendation label, link to full report
- Also sent when invites are dispatched (configurable via `notifyOnInvite` setting)
- Controlled by `notifyOnComplete` and `notifyOnInvite` flags in `recruiter_settings`

---

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (Neon)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# AI
GEMINI_API_KEY=AIza...
MURF_API_KEY=...

# Email
RESEND_API_KEY=re_...
PLUNK_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) database
- A [Clerk](https://clerk.com) application
- A [Google AI Studio](https://aistudio.google.com) API key
- A [Murf AI](https://murf.ai) API key
- A [Resend](https://resend.com) account
- A [Plunk](https://useplunk.com) account

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd ai-recuriter-voice-agent
npm install

# 2. Copy and fill environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Push database schema to Neon
npm run db:push

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Commands

```bash
npm run db:push       # push schema directly to Neon (no migration files)
npm run db:generate   # generate Drizzle migration files
npm run db:migrate    # run pending migrations
npm run db:studio     # open Drizzle Studio (visual DB browser)
```

---

## Deployment (Vercel)

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://your-app.vercel.app`)
5. Deploy — Neon's serverless driver works natively in Vercel Edge and Serverless functions

### Clerk Webhook Setup (required for user sync)
1. In Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-app.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`
4. Copy the signing secret → set as `CLERK_WEBHOOK_SECRET`

---

## Key Design Decisions

- **Batch question generation** — All questions are fetched in a single Gemini call at session start rather than one call per question. This eliminates mid-interview latency and reduces API quota usage by ~8x.
- **Murf TTS proxy** — The Murf API key is never exposed to the browser. All TTS requests go through `/api/interview/tts` which streams the MP3 buffer back to the client.
- **Continuous speech recognition** — `SpeechRecognition` runs in `continuous: true` mode so Chrome never auto-stops mid-sentence. A 3-second silence timer after the last `onresult` event determines when the candidate has finished answering.
- **Fire-and-forget notifications** — Recruiter email notifications are sent asynchronously and never block the interview completion response. Errors are silently swallowed to prevent notification failures from affecting the candidate experience.
- **Multi-model cascade** — All Gemini calls try `gemini-2.0-flash-lite` first (fastest, cheapest), then fall back through `gemini-2.0-flash` and `gemini-1.5-flash` on 429/quota errors, then fall back to deterministic templates or local scoring.
- **Serverless-first** — Neon's HTTP driver (`@neondatabase/serverless`) and Drizzle ORM are used instead of a connection-pooled driver, making every API route safe to run in Vercel's serverless/edge environment.
