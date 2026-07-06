# e Persona

An AI-powered chat application that lets you have conversations with AI-simulated versions of **Hitesh Choudhary** and **Piyush Garg** — two well-known tech educators in the Indian developer community. Built for the GenAI with JS cohort assignment.

**Live demo:** [epersona.deepakverma.dev](https://epersona.deepakverma.dev)

**Repository:** [github.com/deepakwerma/ePersona](https://github.com/deepakwerma/ePersona)

---

## Overview

e Persona simulates two distinct personas using layered, transcript-grounded system prompts rather than generic character descriptions. Each persona reflects its real-world counterpart's speaking style, teaching approach, vocabulary, and behavioral patterns — including how they react to off-topic questions, shortcuts-seekers, and attempts to derail the conversation.

Users can switch between personas at any point and get responses styled specifically to that person's authentic voice.

---

## Features

- **Dual persona chat** — talk to Hitesh Choudhary or Piyush Garg
- **Persona switching** — toggle between personas from the chat header
- **Authentic voice** — system prompts built from real YouTube transcript analysis, not guesswork
- **Hinglish output** — responses in natural Hindi-English code-switching, written in Roman script for readability
- **Context-aware replies** — full conversation history maintained within a session
- **Google/email authentication** via Clerk
- **Cost-safe usage limits** — lifetime message quota, rate limiting, and an automatic budget circuit breaker (see [DOCUMENTATION.md](./DOCUMENTATION.md) for details)
- **Responsive UI** — works across mobile and desktop
- **Markdown-aware rendering** — replies render lists/emphasis where genuinely useful

---

## Tech Stack

| Layer              | Technology                                                |
| ------------------ | --------------------------------------------------------- |
| Framework          | Next.js (App Router)                                      |
| Styling            | Tailwind CSS                                              |
| Animation          | Framer Motion                                             |
| Icons              | lucide-react                                              |
| Authentication     | Clerk                                                     |
| LLM Provider       | DeepSeek API (`deepseek-v4-flash`), OpenAI-compatible SDK |
| Markdown rendering | react-markdown                                            |
| Deployment         | Vercel                                                    |

---

## Project Structure

```
app/
  (app)/
    ai-chat/
      page.tsx          → Main chat interface (both personas, persona switch, composer)
  api/
    chat/
      route.ts          → API route: auth check, rate limit, quota, calls LLM
lib/
  prompts.ts             → System prompts for both personas
  ai.ts                  → DeepSeek client + reply generation
  usage.ts                → In-memory rate limiting, lifetime quota, budget circuit breaker
components/
  Sidebar.tsx             → Chat navigation sidebar
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [DeepSeek API key](https://platform.deepseek.com)
- A [Clerk](https://clerk.com) account (free tier is sufficient)

### Installation

```bash
git clone https://github.com/deepakwerma/ePersona.git
cd ePersona
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your own keys:

```
DEEPSEEK_API_KEY=your_deepseek_api_key
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
3. Use the persona toggle in the top bar to switch between **Hitesh** and **Piyush**
4. Each account has a limited number of free messages (see below) — the remaining count is shown in the header

---

## API Cost & Usage Limits

This project runs on a small, fixed API budget. To keep spend predictable, three safeguards are built in:

- **Lifetime message quota** — each signed-in user gets a fixed number of total messages, shared across both personas
- **Rate limiting** — requests faster than ~3 seconds apart from the same user are rejected
- **Budget circuit breaker** — cumulative token spend is tracked; the chat endpoint auto-disables once a spend threshold is crossed, showing a "temporarily paused" message instead of failing silently

Full reasoning and numbers behind these limits are in [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## Known Limitations

- **Usage tracking is in-memory**, not database-backed. It resets on server restart and doesn't persist reliably across serverless cold starts. A future iteration would move this to a persistent store (e.g. Postgres/NeonDB).
- **Persona switching does not yet inject a mid-conversation context marker.** Switching personas mid-chat currently relies on the new system prompt alone; in rare cases the model may still lean on the previous persona's earlier replies in history. Planned fix: insert a hidden marker message at the switch point so the model treats prior assistant turns strictly as reference context, not its own established voice.
- **No persistent chat history** — conversations reset on page refresh; there is no database-backed chat storage yet.

---

## Author

Built by **Deepak Verma** ([@deepakwerma](https://github.com/deepakwerma)) for the GenAI with JS cohort assignment.
