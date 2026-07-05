"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Persona = "hitesh" | "piyush";
type Message = { role: "user" | "assistant"; content: string };

const PERSONAS: Record<Persona, { name: string; tagline: string }> = {
  hitesh: { name: "Hitesh Choudhary", tagline: "Chai aur Code" },
  piyush: { name: "Piyush Garg", tagline: "Full-stack & systems" },
};

async function sendMessage(persona: Persona, history: Message[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, messages: history }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
  const data = await res.json();
  return { reply: data.reply as string, remaining: data.remaining as number };
}

export default function AIChatPage() {
  const [persona, setPersona] = useState<Persona>("hitesh");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    try {
      const { reply, remaining } = await sendMessage(persona, next);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setRemaining(remaining);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-[#0C0C0B] text-[#F5F3EE]">
      <div className="flex items-center justify-between border-b border-[#26251F] px-3 py-3 sm:px-6 sm:py-4">
        <span className="text-sm font-medium text-[#948F86]">e Persona</span>
        {remaining !== null && (
          <span className="text-xs text-[#948F86]">{remaining} left</span>
        )}
        <div className="flex gap-1 rounded-full border border-[#26251F] p-1">
          {(Object.keys(PERSONAS) as Persona[]).map((key) => (
            <button
              key={key}
              onClick={() => setPersona(key)}
              className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                persona === key
                  ? "bg-[#FACC15] text-[#0C0C0B]"
                  : "text-[#948F86] hover:text-[#F5F3EE]"
              }`}
            >
              {PERSONAS[key].name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center sm:px-6"
            >
              <Sparkles className="h-6 w-6 text-[#FACC15]" strokeWidth={1.5} />
              <h1 className="text-xl font-semibold sm:text-2xl">
                Ask {PERSONAS[persona].name.split(" ")[0]} anything
              </h1>
              <p className="text-sm text-[#948F86]">
                {PERSONAS[persona].tagline}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-[88%] gap-2 sm:max-w-[75%] sm:gap-3">
                    {m.role === "assistant" && (
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#26251F] text-xs font-medium">
                        {PERSONAS[persona].name[0]}
                      </div>
                    )}
                    <div
                      className={` wrap-break-word rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed sm:px-4 sm:py-3 sm:text-base ${
                        m.role === "user"
                          ? "bg-[#FACC15] text-[#0C0C0B]"
                          : "border border-[#26251F] bg-[#141413]"
                      }`}
                    >
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start gap-2 sm:gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#26251F] text-xs font-medium">
                    {PERSONAS[persona].name[0]}
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl border border-[#26251F] bg-[#141413] px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-[#948F86]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-[#26251F] px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-[#26251F] bg-[#141413] p-2 focus-within:ring-1 focus-within:ring-[#FACC15]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask anything..."
            className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#948F86]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FACC15] text-[#0C0C0B] transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
