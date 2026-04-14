import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  level: text("level").notNull(),
  questions: text("questions").notNull(),
  techstack: text("techstack").notNull(),
  type: text("type").notNull(),
  finalized: text("finalized").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recruiter-level settings (one row per recruiter/user)
export const recruiterSettings = pgTable("recruiter_settings", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  // Company
  companyName: text("company_name").default("RecruiterAI"),
  companyIndustry: text("company_industry").default(""),
  companyWebsite: text("company_website").default(""),
  recruiterEmail: text("recruiter_email").default(""),
  // AI Voice Agent
  agentName: text("agent_name").default("Alex"),
  questionsScreening: integer("questions_screening").default(5),
  questionsTechnical: integer("questions_technical").default(8),
  questionsHrFinal: integer("questions_hr_final").default(6),
  silenceTimeoutMs: integer("silence_timeout_ms").default(2000),
  maxListenMs: integer("max_listen_ms").default(45000),
  // Prompt customisation
  greetingPrompt: text("greeting_prompt").default(""),
  questionStylePrompt: text("question_style_prompt").default(""),
  closingPrompt: text("closing_prompt").default(""),
  // Scoring
  minHireScore: integer("min_hire_score").default(70),
  technicalWeight: integer("technical_weight").default(60),   // % weight
  communicationWeight: integer("communication_weight").default(40),
  // Notifications
  notifyOnInvite: text("notify_on_invite").default("true"),
  notifyOnComplete: text("notify_on_complete").default("true"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recruiter-added candidates
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(""),
  roleApplied: text("role_applied").notNull(),
  experience: text("experience").default(""),  // e.g. "3 years"
  skills: text("skills").default(""),           // comma-separated
  resumeText: text("resume_text").default(""),  // extracted resume text
  status: text("status").notNull().default("new"), // new | screening | interview | hired | rejected
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stores each candidate's interview session + full transcript
export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  interviewId: text("interview_id").notNull(),
  jobId: integer("job_id").default(0),              // links back to jobs table
  candidateName: text("candidate_name").notNull(),
  transcript: text("transcript").notNull(), // JSON stringified ChatMessage[]
  status: text("status").notNull().default("completed"), // completed | incomplete
  role: text("role").notNull(),
  level: text("level").notNull(),
  techstack: text("techstack").notNull(),
  company: text("company").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job postings created by recruiters
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").default(""),
  location: text("location").default(""),
  type: text("type").default("full-time"),       // full-time | part-time | contract | remote
  experience: text("experience").default(""),    // e.g. "3-5 years"
  salary: text("salary").default(""),            // e.g. "$80k-$100k"
  description: text("description").default(""),
  requirements: text("requirements").default(""), // newline-separated
  skills: text("skills").default(""),             // comma-separated
  status: text("status").notNull().default("draft"), // draft | active | expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Candidates invited to interview for a specific job
export const jobInvites = pgTable("job_invites", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  status: text("status").notNull().default("pending"), // pending | completed | expired
  interviewLink: text("interview_link").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stores AI-generated analysis summary for each session
export const interviewSummaries = pgTable("interview_summaries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().unique(),
  overallScore: integer("overall_score").notNull(),       // 0-100
  technicalScore: integer("technical_score").notNull(),   // 0-100
  communicationScore: integer("communication_score").notNull(), // 0-100
  recommendation: text("recommendation").notNull(),       // hire | maybe | no
  strengths: text("strengths").notNull(),                 // JSON string[]
  weaknesses: text("weaknesses").notNull(),               // JSON string[]
  summary: text("summary").notNull(),                     // paragraph summary
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
