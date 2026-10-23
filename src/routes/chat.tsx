import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Sparkles, Copy } from "lucide-react";
import { demoChat, wait } from "@/lib/demo-ai";
import { recordUsage, useLocalState } from "@/lib/usage";
import { Disclaimer, PageHeader } from "@/components/tool-kit";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [
    { title: "Workplace Chat — AI Workplace Assistant" },
    { name: "description", content: "Chat with a workplace assistant for quick productivity tips and guidance." },
    { property: "og:title", content: "Workplace Chat Assistant" },
    { property: "og:description", content: "Interactive help for emails, meetings, planning and focus." },
  ] }),
  component: ChatPage,
});

interface Msg { role: "user" | "assistant"; text: string }
const WELCOME: Msg = { role: "assistant", text: "Hi! I'm the demo workplace assistant. I give rule-based tips (not real AI). What can I help with?" };
const SUGGEST = ["How do I prioritise my tasks?", "Tips for writing a follow-up email", "How can I stay focused?", "How do I run better meetings?"];

function ChatPage() {
  const [msgs, setMsgs] = useLocalState<Msg[]>("awpa-chat", [WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, typing]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setTyping(true);
    await wait(600);
    setMsgs((m) => [...m, { role: "assistant", text: demoChat(q) }]);
    setTyping(false);
    recordUsage("chat", `Chat: ${q}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Workplace Chat" description="Ask quick questions about emails, meetings, priorities and focus." />
      <section className="card-surface flex h-[65vh] min-h-[420px] flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <Sparkles className="h-4 w-4 text-fawn" /><span className="text-sm font-semibold">Assistant</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase">Demo replies</span>
          <button onClick={() => setMsgs([WELCOME])} className="btn btn-ghost ml-auto px-3 py-1.5 text-xs"><Trash2 className="h-3.5 w-3.5" /> Clear chat</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`group flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary"}`}>
                {m.text}
                {m.role === "assistant" && i > 0 && (
                  <button onClick={() => navigator.clipboard?.writeText(m.text)} aria-label="Copy reply" className="ml-2 inline-flex align-middle opacity-50 hover:opacity-100"><Copy className="h-3.5 w-3.5" /></button>
                )}
              </div>
            </div>
          ))}
          {typing && <div className="flex gap-1 rounded-2xl bg-secondary px-4 py-3 w-fit" aria-label="Assistant is typing">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-fawn" style={{ animationDelay: `${d * 120}ms` }} />)}</div>}
          <div ref={end} />
        </div>
        {msgs.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border bg-cream px-3 py-1.5 text-xs hover:bg-secondary">{s}</button>)}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t p-3">
          <label htmlFor="chat-in" className="sr-only">Message</label>
          <input id="chat-in" className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" maxLength={500} />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || typing} aria-label="Send"><Send className="h-4 w-4" /></button>
        </form>
      </section>
      <Disclaimer />
    </div>
  );
}
