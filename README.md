# e Persona

An AI-powered chat application that lets you have conversations with AI-simulated versions of **Hitesh Choudhary** and **Piyush Garg** — two well-known tech educators in the Indian developer community. Built for the GenAI with JS cohort assignment.

**Live demo:** [epersona.deepakverma.dev](https://epersona.deepakverma.dev)
**Repository:** [github.com/deepakwerma/ePersona](https://github.com/deepakwerma/ePersona)

---

## Overview

e Persona simulates two distinct personas using layered, transcript-grounded system prompts rather than generic character descriptions. Each persona reflects its real-world counterpart's speaking style, teaching approach, vocabulary, and behavioral patterns — including how they react to off-topic questions, shortcut-seekers, and attempts to derail the conversation.

Users can switch between personas at any point, and each persona can pull in real, live data — its own YouTube videos — via tool-calling, rather than relying purely on the model's static knowledge.

---

## Features

- **Dual persona chat** — talk to Hitesh Choudhary or Piyush Garg
- **Persona switching** — toggle between personas from the chat header
- **Authentic voice** — system prompts built from real YouTube transcript analysis, not guesswork
- **Hinglish output** — responses in natural Hindi-English code-switching, written in Roman script for readability
- **Live video search tool** — the model can call the YouTube Data API to find and link the persona's own real videos relevant to a topic, formatted as clickable markdown links
- **Persistent chat history** — conversations are stored in a Postgres (Neon) database per user and persona, and reload automatically on return visits
- **Google/email authentication** via Clerk
- **Cost-safe usage limits** — lifetime message quota, rate limiting, and an automatic budget circuit breaker, all backed by the database so limits persist reliably (see [DOCUMENTATION.md](./DOCUMENTATION.md) for details)
- **Responsive UI** — custom design system (shadcn sidebar, Space Grotesk/Inter/JetBrains Mono typography, warm dark palette), tested across mobile, tablet, and desktop
- **Markdown-aware rendering** — replies render links, lists, and emphasis where genuinely useful, with links visually styled so they're clearly distinguishable from plain text

---

## Tech Stack

| Layer              | Technology                                                                          |
| ------------------ | ----------------------------------------------------------------------------------- |
| Framework          | Next.js (App Router)                                                                |
| Styling            | Tailwind CSS v4 + custom design tokens                                              |
| UI Components      | shadcn/ui (base-vega style) — Sidebar, Dropdown Menu, Avatar                        |
| Animation          | Framer Motion                                                                       |
| Icons              | lucide-react                                                                        |
| Typography         | Space Grotesk (headings), Inter (body), JetBrains Mono (code)                       |
| Authentication     | Clerk                                                                               |
| Database           | Neon (serverless Postgres)                                                          |
| LLM Provider       | DeepSeek API (`deepseek-v4-flash`), OpenAI-compatible SDK, with native tool-calling |
| External API       | YouTube Data API v3 (persona video search)                                          |
| Markdown rendering | react-markdown                                                                      |
| Deployment         | Vercel                                                                              |

---

## Project Structure

```
app/
  (app)/
    layout.tsx           → Sidebar + main content shell (SidebarProvider)
    ai-chat/
      page.tsx            → Main chat interface (persona switch, composer, message list)
  api/
    chat/
      route.ts             → Auth check, rate limit, quota, calls LLM, saves messages
    history/
      route.ts             → Loads persisted chat history per user + persona
lib/
  prompts.ts               → System prompts for both personas
  ai.ts                    → LLM client, tool-calling loop, retry-on-empty-reply logic
  usage.ts                 → Database-backed rate limiting, lifetime quota, budget circuit breaker
  db.ts                    → Neon serverless client
  chat.ts                  → Save/load chat messages from Postgres
  tools/
    channels.ts             → YouTube channel ID configuration per persona
    youtube.ts               → Live YouTube video search tool
components/
  Sidebar.tsx               → shadcn-based sidebar (chat history, profile, Clerk sign-out)
  ui/                       → Generated shadcn components (sidebar, dropdown-menu, avatar, button)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [DeepSeek API key](https://platform.deepseek.com)
- A [Clerk](https://clerk.com) account (free tier is sufficient)
- A [Neon](https://neon.tech) Postgres database (free tier is sufficient)
- A [YouTube Data API v3](https://console.cloud.google.com) key

### Installation

```bash
git clone https://github.com/deepakwerma/ePersona.git
cd ePersona
npm install
```

### Database Setup

Run the following in your Neon project's SQL editor once:

```sql
CREATE TABLE usage_tracking (
  user_id TEXT PRIMARY KEY,
  message_count INT NOT NULL DEFAULT 0,
  last_request_at BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE global_spend (
  id INT PRIMARY KEY DEFAULT 1,
  total_usd NUMERIC NOT NULL DEFAULT 0
);
INSERT INTO global_spend (id, total_usd) VALUES (1, 0);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  persona TEXT NOT NULL CHECK (persona IN ('hitesh', 'piyush')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_user_persona ON messages(user_id, persona);
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your own keys:

```
API_KEY=your_deepseek_api_key
DATABASE_URL=your_neon_connection_string
YOUTUBE_API_KEY=your_youtube_data_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Sign in with Google or email (via Clerk)
2. You'll land on the chat screen with an empty state — ask anything to start
3. Use the persona toggle in the top bar to switch between **Hitesh** and **Piyush** — each persona's own conversation history loads automatically
4. Ask something like _"any video on closures?"_ — the model will search that persona's real YouTube channel(s) and reply with an actual, clickable video link
5. Each account has a limited number of free messages, shared across both personas — the remaining count is shown in the header

---

## API Cost & Usage Limits

This project runs on a small, fixed API budget. To keep spend predictable, four safeguards are built in, all backed by the Neon database so they persist reliably across server restarts:

- **Lifetime message quota** — each signed-in user gets a fixed number of total messages, shared across both personas
- **Rate limiting** — requests faster than ~3 seconds apart from the same user are rejected
- **Budget circuit breaker** — cumulative token spend is tracked; the chat endpoint auto-disables once a spend threshold is crossed, showing a "temporarily paused" message instead of failing silently
- **Tool-call round cap** — the model can make at most 4 tool-calling round-trips per message, preventing runaway cost if it gets stuck requesting tools repeatedly

Full reasoning and numbers behind these limits are in [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## Known Limitations

- **Course suggestion tool was planned but not implemented** — the video-search tool (YouTube) is live, but a second tool for suggesting each persona's paid courses/cohorts was scoped and designed but not built before submission.
- **No multi-conversation history per persona** — each persona currently has exactly one continuous thread per user, not a list of separately named past chats. A "New chat" concept would require a further schema change (a `conversations` table) not yet implemented.
- **Persona switching resets the visible conversation** — switching from Hitesh to Piyush (or back) starts that persona's thread from its own saved history rather than continuing a single merged thread. This was a deliberate simplification over a more complex mid-conversation context-marker approach, chosen for reliability within the project's time constraints.

---

## Author

Built by **Deepak Verma** ([@deepakwerma](https://github.com/deepakwerma)) for the GenAI with JS cohort assignment.
