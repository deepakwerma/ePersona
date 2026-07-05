import { OpenAI } from "openai";
import { PERSONAS, PersonaKey } from "./prompts";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.API_KEY, // server-only, never exposed to browser
});

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function getPersonaReply(
  persona: PersonaKey,
  history: ChatMessage[],
) {
  const messages = [
    { role: "system" as const, content: PERSONAS[persona].systemPrompt },
    ...history,
  ];

  const result = await client.chat.completions.create({
    model: "deepseek-v4-flash",
    messages,
    max_tokens: 300,
  });

  return {
    reply: result.choices[0].message.content ?? "",
    usage: result.usage,
  };
}
