import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarCheck, Search, MessageCircle, Clock, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { useUsage, MINUTES_SAVED, type ToolKey } from "@/lib/usage";
import { Disclaimer } from "@/components/tool-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your productivity overview with AI tools for emails, meeting notes, task planning and research." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Save hours every week with smart email drafts, meeting summaries, task plans and research briefs." },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  { key: "email", to: "/email", title: "Smart Email Generator", desc: "Draft emails in Formal, Friendly or Persuasive tones.", icon: Mail },
  { key: "meetings", to: "/meetings", title: "Meeting Notes Summarizer", desc: "Extract summaries, decisions, actions and deadlines.", icon: NotebookPen },
  { key: "planner", to: "/planner", title: "AI Task Planner", desc: "Turn task lists into prioritised daily or weekly plans.", icon: CalendarCheck },
  { key: "research", to: "/research", title: "AI Research Assistant", desc: "Structure topics into insights and recommendations.", icon: Search },
] as const;

const LABELS: Record<ToolKey, string> = { email: "Email", meetings: "Meeting", planner: "Planner", research: "Research", chat: "Chat" };
const WEEK = [{ d: "Mon", v: 42 }, { d: "Tue", v: 65 }, { d: "Wed", v: 38 }, { d: "Thu", v: 80 }, { d: "Fri", v: 55 }, { d: "Sat", v: 12 }, { d: "Sun", v: 8 }];

function Dashboard() {
  const { counts, activity } = useUsage();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const minutes = (Object.keys(counts) as ToolKey[]).reduce((a, k) => a + counts[k] * MINUTES_SAVED[k], 0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const max = Math.max(...WEEK.map((w) => w.v));

  const stats = [
    { label: "Generations this session", value: total, icon: Zap },
    { label: "Est. time saved", value: minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`, icon: Clock },
    { label: "Weekly focus score", value: "78%", icon: TrendingUp, note: "sample data" },
  ];

  return (
    <div className="space-y-8">
      <section className="hero-gradient relative overflow-hidden rounded-3xl p-6 shadow-lift sm:p-10">
        <p className="text-sm font-medium opacity-75">{greet}, Lebohang</p>
        <h1 className="mt-2 max-w-xl text-3xl leading-tight sm:text-5xl">Work smarter. Reclaim your hours.</h1>
        <p className="mt-3 max-w-lg text-sm opacity-80 sm:text-base">Four focused assistants for the work that eats your week — plus a chat helper for everything in between.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/email" className="btn bg-fawn text-espresso hover:bg-cream">Draft an email <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/chat" className="btn border border-espresso-foreground/30 hover:bg-espresso-foreground/10">Open chat</Link>
        </div>
      </section>

      <section aria-label="Productivity overview" className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="card-surface p-5">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="h-5 w-5 text-fawn" /></div>
            <p className="mt-2 font-display text-3xl">{value}</p>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl">AI tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map(({ key, to, title, desc, icon: Icon }) => (
            <Link key={key} to={to} className="card-surface group flex gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
                <p className="mt-2 text-xs font-semibold text-fawn">{counts[key]} use(s) · ~{MINUTES_SAVED[key]} min saved each</p>
              </div>
              <ArrowRight className="h-5 w-5 self-center text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="card-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between"><h2 className="text-xl">Focus hours this week</h2><span className="text-xs text-muted-foreground">sample data</span></div>
          <div className="flex h-40 items-end gap-3" role="img" aria-label="Bar chart of sample weekly focus time">
            {WEEK.map((w) => (
              <div key={w.d} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-fawn/80" style={{ height: `${(w.v / max) * 100}%` }} />
                <span className="text-xs text-muted-foreground">{w.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-xl">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Try a tool — your recent generations appear here (stored only in this browser).</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-fawn" />
                  <div className="min-w-0"><p className="truncate">{a.label}</p><p className="text-xs text-muted-foreground">{LABELS[a.tool]} · {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
