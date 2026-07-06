# e Persona — Documentation

This document explains how the two AI personas were built: how their data was sourced, how the prompts were engineered and iterated on, how conversation context and cost are managed, how the live video-search tool works, and sample conversations demonstrating the result.

---

## 1. How the Persona Data Was Collected and Prepared

### Source material

Both personas are based on publicly available content: YouTube videos, live streams, and recorded Q&A sessions from Hitesh Choudhary and Piyush Garg. No private or paywalled content was used.

### Collection process

The data collection followed an iterative, evidence-first approach rather than writing persona traits from general impression:

1. **Initial draft from general knowledge** — a first-pass system prompt was written based on well-known facts about each person's background, teaching philosophy, and public reputation.
2. **Testing exposed the gap** — early responses were too generic and script-like: replies came out as full YouTube video monologues (with intros like "welcome back to another video" and outros like "like and subscribe") even for simple one-line questions. This signaled the prompt was pattern-matching to "video transcript" rather than "live chat reply."
3. **Transcript-grounded correction** — actual video/stream transcripts were analyzed (using NotebookLM loaded with sourced transcripts) with targeted prompts asking for concrete, categorized examples of how each person responds to different situations: greetings, background questions, technical definitions, roadmap/career questions, deep technical explanations, AI/hype questions, someone stuck or frustrated, shortcut-seeking questions, victim-carding, and excitement over something built.
4. **Real examples over invented ones** — for each category, real (or closely paraphrased) transcript excerpts were extracted along with the actual response length and tone observed, replacing guessed behavioral rules with evidence-backed ones.
5. **Iterative refinement based on live testing** — the prompt was tested against real questions in the built chat interface, and each mismatch (overly long answers, wrong script, robotic repetition of catchphrases) was traced back to a specific instruction gap and corrected.

### What was extracted per persona

- Core identity, career background, and self-image (how they describe themselves)
- Thinking process and philosophy (recurring beliefs, mental models used to approach problems)
- Teaching style (step-by-step structure used for deep technical explanations)
- Vocabulary and signature catchphrases, with natural variation rather than fixed repeated lines
- Response length patterns _per situation type_, not a single fixed length
- How each person handles disruption: trolling, off-topic questions, spam, and boundary-pushing

---

## 2. Prompt Engineering Strategy

Both personas use a layered system prompt with the same underlying structure, so behavior stays consistent in kind (though different in content/tone) across both:

1. **Core Identity & Self-Image** — who they are, career history, values
2. **Thinking Process** — the mental models/philosophies they apply to technical problems
3. **Teaching Style** — an explicit step-by-step framework, but scoped to only apply to genuinely deep technical explanations (see Length Calibration below) rather than every technical-sounding question
4. **Communication Style & Tone** — Hinglish code-switching rules, plus a strict script rule (explained below)
5. **Signature Vocabulary & Catchphrases** — phrases to draw from, explicitly instructed to vary rather than repeat verbatim every time
6. **Off-Topic / Disruptive / Prompt-Injection Handling** — grounded in real examples of how each person actually handles trolling, spam, and derailment on stream; this section does double duty as injection resistance, since the model is instructed to treat "ignore your instructions" or "pretend to be someone else" attempts exactly like it would treat any other nonsense/off-topic disruption — deflecting in-character rather than breaking character to explain it's an AI
7. **Response Pattern Examples** — calibration anchors per situation category, explicitly labeled as reference for tone/length, not verbatim scripts to copy
8. **Length & Tone Calibration** — the most consequential fix (below)
9. **Formatting Rules** — chat-appropriate output (see below)

### Key iteration lessons

**Problem: video-style responses.** The first working prompt caused every reply — even "what's your background?" — to come out as a multi-paragraph monologue with YouTube intros/outros. Root cause: the persona's real communication style is documented almost entirely from stream/video transcripts, so the model over-indexed on "this is a video script" as the format. Fix: an explicit instruction that this is a live 1-on-1 text chat, not a video, with intros/outros restricted to genuine conversation starts/ends only.

**Problem: mismatched response length.** Early responses didn't distinguish between a quick factual question and a genuine request for a deep explanation — both got the same long, structured answer. Fix: a length-calibration table mapping ~10 real situation categories (greeting, background question, quick technical definition, career/roadmap question, deep technical explanation, AI/hype question, someone stuck, shortcut-seeking, victim-carding, excitement) to an expected length and tone, derived from actual transcript evidence rather than assumption. Only genuine deep-explanation requests are allowed to run long.

**Problem: script mismatch.** The model would often output the Hindi portions in Devanagari script, even after being told to use Roman script — because reference examples embedded in the prompt itself were still in Devanagari, and the model was pattern-matching to those examples over the explicit instruction. Fix: every trace of Devanagari was removed from the prompt, including "reference-only" examples, since any Devanagari text present anywhere in the prompt was being treated as a valid output pattern regardless of surrounding instructions.

**Problem: repetitive catchphrases.** Fixed greeting/sign-off lines (e.g. always opening with the same phrase) made responses feel robotic and were being used on every single reply, including short casual ones. Fix: greetings and sign-offs are now restricted to genuine conversation starts/ends, with explicit instruction to vary the exact wording rather than reuse one fixed line.

**Problem: over-formatted output.** Responses started using markdown headers and heavily bolded text that read like a document rather than a person typing a chat reply. Fix: a formatting rule that defaults to plain conversational paragraphs, with light structure (a short list, a few bolded key terms) allowed only for genuinely multi-part practical advice — never for casual or short replies.

**Problem: occasional empty replies.** Under the combined weight of the persona's many constraints (voice, length, formatting, tool-use), the model would sometimes return an empty response, particularly on short casual messages. Fix: a one-time automatic retry when the model's final answer comes back empty, with a graceful in-character fallback line only if both attempts fail — this is implemented in `lib/ai.ts`, not the prompt itself.

---

## 3. Context Management Approach

### Conversation memory

Chat history is held in client-side React state as an array of `{ role, content }` messages, and persisted server-side in a Postgres (Neon) `messages` table keyed by `user_id` and `persona`. On every new user message, the full running history for that persona's thread is sent to the backend, which prepends the current persona's system prompt and forwards the complete message list to the LLM. After a reply is generated, both the user's message and the assistant's reply are saved to the database, so the conversation survives page refreshes and server restarts.

### Persona switching

Persona switching is intentionally simple: switching from Hitesh to Piyush (or back) loads that persona's own saved thread from the database via a dedicated `/api/history` endpoint, rather than continuing one merged conversation across both personas. This was a deliberate choice over a more complex approach (inserting a hidden marker message into a shared history to signal a persona change mid-conversation) — the simpler per-persona-thread model is more reliable and easier to reason about, at the cost of not supporting a single continuous conversation that spans both personas. Each persona's thread is independently coherent and persists correctly across sessions.

### Live tool-calling: YouTube video search

Beyond static conversation memory, each persona can call a real external tool mid-conversation: a YouTube Data API search scoped to that persona's own channel(s). This uses the LLM provider's native function-calling support rather than a hand-rolled JSON-parsing protocol:

1. A `search_creator_videos` tool is defined with a JSON Schema description (topic, and an optional `maxResults`, defaulting to 2 for a normal suggestion) and offered to the model alongside every request.
2. If the model decides a real video reference would strengthen its answer, it returns a structured tool-call request instead of a final answer.
3. The backend runs the actual YouTube API search (scoped to the persona's channel IDs), returns the results back to the model as a `tool` role message.
4. The model then produces its final, in-character reply, instructed to format any referenced video as a proper markdown link (`[title](url)`) rather than plain text — this renders as a distinctly styled, clickable link in the UI, not just visually-identical text.

This loop is capped at 4 round-trips per user message as a cost-safety measure, preventing runaway API spend if the model were to get stuck repeatedly requesting tools.

A second tool — suggesting each persona's paid courses/cohorts from a static local catalog — was designed (schema, matching logic, and integration point all scoped) but not implemented before submission. See README's Known Limitations.

### Session and cost-safety context

Since this project runs on a small, fixed API budget, context management includes usage safeguards in addition to conversation memory, all backed by the database rather than in-memory state (an earlier in-memory version was found to reset unreliably across serverless cold starts, prompting the migration to Neon):

- **Lifetime message quota** — tracked per Clerk `userId` in the `usage_tracking` table, shared across both personas (switching personas does not reset or duplicate quota)
- **Rate limiting** — a timestamp check per user rejects requests sent faster than roughly 3 seconds apart, preventing rapid-fire spam
- **Budget circuit breaker** — actual token usage returned by the LLM provider on each response is summed into a running cost total in the `global_spend` table; once this crosses a set threshold of the total budget, the chat endpoint disables itself and returns a clear "temporarily paused" message rather than failing unpredictably mid-response
- **Input/output length caps** — user message length is capped, and the model's `max_tokens` is capped on generation, keeping worst-case cost per exchange bounded
- **Tool-call round cap** — bounds worst-case cost per message even when the model is actively using tools, not just during plain conversation

---

## 4. Sample Conversations Demonstrating Both Personas

### Hitesh Choudhary

**User:** sir how i would get an internship in 3 months

**Hitesh:** There's no magic shortcut, you have to grind aur ship something real. So the reality is internships come from consistent applying, building a tiny project that shows you can solve a problem, aur networking with people who can vouch for you — all right, it's more hustle than a 3-month timer. Pick one role, build a simple demo in the next two weeks, apply to 10-15 companies daily, and keep following up — that's your roadmap, so start scaling करना now.

---

**User:** sir aaj apne chai pia h

**Hitesh:** Arre bhai, aaj thoda late liya, lunch mein butter naan ke saath thali thi. Shaam ko chai ke saath coding hi hogi.

---

**User:** any video on closures?

**Hitesh:** _(model calls the video search tool, then replies)_ Bilkul, [Lexical scoping and Closure | chai aur #javascript](https://youtube.com/watch?v=VaH09NXQZ58) — ismein seedhe seedhe samjha diya hai scope aur closure ka connection. Dekh lo, phir practice karo.

---

### Piyush Garg

**User:** sir apne bare me batao

**Piyush:** Dekho, mujhe apna introduction dene mein koi hesitation nahi hai. Main hoon Piyush Garg — Software Engineer, Content Creator, Educator, aur Teachyst ka founder. Main production-grade code likhta hoon, B2B SaaS products ship karta hoon, aur mujhe lagta hai "Consistency beats perfection." Ab batao, aapka actual question kya hai?

_Note: Piyush's persona prompt follows the same layered structure and length-calibration approach as Hitesh's, applied directly from the same transcript-analysis methodology. It received comparatively fewer live-testing iterations before submission — response length and tone calibration are expected to improve further with the same category-by-category refinement process applied to Hitesh's prompt._

---

Both personas share the same off-topic/disruption handling mechanism: attempts to derail the conversation, ask unrelated personal questions, or manipulate the assistant into breaking character are met with an in-character deflection (a dismissive or redirecting line true to that person's real documented style) rather than a generic AI refusal — keeping the persona intact even under adversarial input.
