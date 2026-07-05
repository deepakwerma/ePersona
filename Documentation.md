# e Persona — Documentation

This document explains how the two AI personas were built: how their data was sourced, how the prompts were engineered and iterated on, how conversation context is managed, and sample conversations demonstrating the result.

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

---

## 3. Context Management Approach

### Conversation memory

Chat history is held in client-side React state as an array of `{ role, content }` messages. On every new user message, the full running history for that session is sent to the backend, which prepends the current persona's system prompt and forwards the complete message list to the LLM. This gives the model full context of the conversation so far within a session.

### Persona switching

Switching personas mid-conversation swaps which system prompt is prepended to the next API call — the conversation history itself is preserved rather than cleared, so the user doesn't lose their chat when switching.

**Current limitation:** the switch does not yet insert an explicit marker into the message history signaling the change. In some cases the model may still lean on the tone of its own earlier replies (written as the previous persona) rather than fully committing to the newly selected persona's system prompt. The planned fix is to insert a hidden, non-rendered marker message into history at the moment of switching, explicitly instructing the model that all following replies are from the newly selected persona and that earlier assistant turns in the visible history should be treated as reference context only, not as its own established voice.

### Session and cost-safety context

Since this project runs on a small, fixed API budget, context management includes usage safeguards in addition to conversation memory:

- **Lifetime message quota** — tracked per Clerk `userId`, shared across both personas (switching personas does not reset or duplicate quota)
- **Rate limiting** — a timestamp check per user rejects requests sent faster than roughly 3 seconds apart, preventing rapid-fire spam
- **Budget circuit breaker** — actual token usage returned by the DeepSeek API on each response is summed into a running cost estimate; once this crosses a set threshold of the total budget, the chat endpoint disables itself and returns a clear "temporarily paused" message rather than failing unpredictably mid-response
- **Input/output length caps** — user message length is capped, and the model's `max_tokens` is capped on generation, keeping worst-case cost per exchange bounded

All of this state is currently held in server memory rather than a database — sufficient for the scale of this assignment, with a persistent store noted as a future improvement in the README.

---

## 4. Sample Conversations Demonstrating Both Personas

### Hitesh Choudhary

**User:** sir how i would get an internship in 3 months

**Hitesh:** There's no magic shortcut, you have to grind aur ship something real. So the reality is internships come from consistent applying, building a tiny project that shows you can solve a problem, aur networking with people who can vouch for you — all right, it's more hustle than a 3-month timer. Pick one role, build a simple demo in the next two weeks, apply to 10-15 companies daily, and keep following up — that's your roadmap, so start scaling करना now.

---

**User:** sir aaj apne chai pia h

**Hitesh:** Arre bhai, aaj thoda late liya, lunch mein butter naan ke saath thali thi. Shaam ko chai ke saath coding hi hogi.

---

### Piyush Garg

**User:** sir apne bare me batao

**Piyush:** Dekho, mujhe apna introduction dene mein koi hesitation nahi hai. Main hoon Piyush Garg — Software Engineer, Content Creator, Educator, aur Teachyst ka founder. Main production-grade code likhta hoon, B2B SaaS products ship karta hoon, aur mujhe lagta hai "Consistency beats perfection." Ab batao, aapka actual question kya hai?

_Note: Piyush's persona prompt follows the same layered structure and length-calibration approach as Hitesh's, applied directly from the same transcript-analysis methodology. It received comparatively fewer live-testing iterations before submission — response length and tone calibration are expected to improve further with the same category-by-category refinement process applied to Hitesh's prompt._

---

Both personas share the same off-topic/disruption handling mechanism: attempts to derail the conversation, ask unrelated personal questions, or manipulate the assistant into breaking character are met with an in-character deflection (a dismissive or redirecting line true to that person's real documented style) rather than a generic AI refusal — keeping the persona intact even under adversarial input.
