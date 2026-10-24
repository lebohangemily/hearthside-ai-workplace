// Rule-based DEMO engine. These outputs are NOT produced by an AI model;
// they are templated from the user's input so the app works fully offline.

export interface Section { title: string; text?: string; items?: string[] }
export interface DemoOutput { sections: Section[] }

export const wait = (ms = 700 + Math.random() * 600) => new Promise((r) => setTimeout(r, ms));

const sentences = (t: string) =>
  t.replace(/\n+/g, ". ").split(/(?<=[.!?])\s+|\.\s/).map((s) => s.trim().replace(/[.]+$/, "")).filter((s) => s.length > 3);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function sectionsToText(o: DemoOutput) {
  return o.sections
    .map((s) => `${s.title}\n${s.text ?? ""}${s.items ? s.items.map((i) => `• ${i}`).join("\n") : ""}`)
    .join("\n\n");
}

/* ---------- Email ---------- */
export type Tone = "Formal" | "Friendly" | "Persuasive";
export function demoEmail(i: { recipient: string; purpose: string; points: string; tone: Tone; sender: string }): DemoOutput {
  const name = i.recipient.trim() || "there";
  const sender = i.sender.trim() || "[Your name]";
  const purpose = i.purpose.trim();
  const pts = i.points.split(/\n|;/).map((p) => p.trim()).filter(Boolean);
  const T = {
    Formal: {
      greet: `Dear ${name},`,
      open: `I am writing regarding ${purpose.toLowerCase()}.`,
      bridge: "Please find the key points outlined below:",
      close: "I would appreciate your confirmation at your earliest convenience. Should you require any further information, please do not hesitate to contact me.",
      sign: `Kind regards,\n${sender}`,
      subject: `Regarding: ${cap(purpose)}`,
    },
    Friendly: {
      greet: `Hi ${name},`,
      open: `Hope your week is going well! I wanted to reach out about ${purpose.toLowerCase()}.`,
      bridge: "Here's a quick rundown:",
      close: "Let me know what you think — happy to jump on a quick call if that's easier.",
      sign: `Cheers,\n${sender}`,
      subject: `Quick note: ${purpose.toLowerCase()}`,
    },
    Persuasive: {
      greet: `Hi ${name},`,
      open: `I'd like to share an opportunity around ${purpose.toLowerCase()} that I believe can deliver real value for your team.`,
      bridge: "Here's why this matters right now:",
      close: "Could we set aside 15 minutes this week to move this forward? I'm confident it will be worth your time.",
      sign: `Best regards,\n${sender}`,
      subject: `${cap(purpose)} — an opportunity worth 15 minutes`,
    },
  }[i.tone];
  const body = [T.greet, "", T.open, ...(pts.length ? ["", T.bridge, ...pts.map((p) => `  • ${cap(p)}`)] : []), "", T.close, "", T.sign].join("\n");
  return {
    sections: [
      { title: "Subject line", text: T.subject },
      { title: `Email (${i.tone} tone)`, text: body },
      { title: "Writing tips", items: [
        i.tone === "Formal" ? "Double-check titles and names for accuracy." : i.tone === "Friendly" ? "Keep it short — friendly emails work best under 150 words." : "Lead with the benefit to the reader, then the ask.",
        pts.length ? `${pts.length} key point(s) included — consider bolding the most important one.` : "Add key points to make the email more specific.",
        "Review before sending; adjust any details the demo couldn't infer.",
      ] },
    ],
  };
}

/* ---------- Meetings ---------- */
const DEADLINE_RE = /\b(by|before|due|until|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next week|end of (?:the )?(?:week|month|quarter|day)|eod|eow|q[1-4]|\d{1,2}(?:st|nd|rd|th)?(?:\s+\w+)?|\w+\s+\d{1,2})/i;
export function demoMeeting(notes: string): DemoOutput {
  const s = sentences(notes);
  const decisions = s.filter((x) => /\b(decided|agreed|approved|confirmed|will go with|chose|final)\b/i.test(x));
  const actions = s.filter((x) => /\b(will|to do|action|assign|needs? to|should|follow up|send|prepare|owner)\b/i.test(x) && !decisions.includes(x));
  const deadlines = s.map((x) => { const m = x.match(DEADLINE_RE); return m ? `${cap(m[2] ?? "")} — ${x}` : null; }).filter(Boolean) as string[];
  const people = Array.from(new Set((notes.match(/\b[A-Z][a-z]{2,}\b/g) ?? []).filter((w) => !/^(The|We|They|Next|Action|Decision|Monday|Tuesday|Wednesday|Thursday|Friday|Meeting|This|Also|Team|Our)$/.test(w)))).slice(0, 6);
  return {
    sections: [
      { title: "Summary", text: `${s.length} discussion point(s) captured${people.length ? ` involving ${people.join(", ")}` : ""}. ${s.slice(0, 2).map(cap).join(". ")}.` },
      { title: "Key decisions", items: decisions.length ? decisions.map(cap) : ["No explicit decisions detected — consider confirming outcomes with attendees."] },
      { title: "Action items", items: actions.length ? actions.map(cap) : ["No action items detected. Tip: phrase tasks like “Sarah will send the report”."] },
      { title: "Deadlines", items: deadlines.length ? deadlines : ["No deadlines detected."] },
    ],
  };
}

/* ---------- Planner ---------- */
export interface PlanTask { task: string; priority: "High" | "Medium" | "Low"; minutes: number }
export function demoPlan(input: string, period: "Daily" | "Weekly", startHour: number): DemoOutput {
  const lines = input.split(/\n/).map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
  const tasks: PlanTask[] = lines.map((l) => {
    const dur = l.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?|m|min|mins|minutes?)\b/i);
    const minutes = dur ? Math.round(parseFloat(dur[1] ?? "0") * (/^h/i.test(dur[2] ?? "") ? 60 : 1)) : /review|email|call/i.test(l) ? 30 : 60;
    const priority = /urgent|asap|deadline|today|client|ceo|critical|due/i.test(l) ? "High" : /review|prepare|update|meeting|report/i.test(l) ? "Medium" : "Low";
    return { task: cap(l.replace(dur?.[0] ?? "", "").replace(/[()]/g, "").trim()), priority, minutes };
  });
  const rank = { High: 0, Medium: 1, Low: 2 };
  tasks.sort((a, b) => rank[a.priority] - rank[b.priority]);
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const sched: string[] = [];
  if (period === "Daily") {
    let t = startHour * 60;
    tasks.forEach((k, idx) => {
      if (t >= 12 * 60 && t < 13 * 60) { sched.push(`${fmt(t)}–${fmt(t + 60)}  Lunch break`); t += 60; }
      sched.push(`${fmt(t)}–${fmt(t + k.minutes)}  ${k.task} [${k.priority}]`);
      t += k.minutes + (idx % 2 === 1 ? 15 : 5);
    });
  } else {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const load = days.map(() => 0);
    const out: string[][] = days.map(() => []);
    tasks.forEach((k) => { const d = load.indexOf(Math.min(...load)); load[d]! += k.minutes; out[d]!.push(`${k.task} (${k.minutes}m, ${k.priority})`); });
    days.forEach((d, i) => sched.push(`${d}: ${out[i]!.length ? out[i]!.join(" · ") : "Buffer / deep work"}`));
  }
  const total = tasks.reduce((a, b) => a + b.minutes, 0);
  return {
    sections: [
      { title: "Prioritised tasks", items: tasks.map((k) => `[${k.priority}] ${k.task} — ~${k.minutes} min`) },
      { title: `${period} schedule`, items: sched },
      { title: "Insights", items: [
        `Total planned effort: ${(total / 60).toFixed(1)} hours across ${tasks.length} task(s).`,
        tasks.filter((k) => k.priority === "High").length > 3 ? "You have many high-priority items — consider delegating or renegotiating a deadline." : "High-priority work is scheduled first, while energy is highest.",
        period === "Daily" && total > 7 * 60 ? "This day is over-booked; move low-priority tasks to tomorrow." : "Short breaks are built in to protect focus.",
      ] },
    ],
  };
}

/* ---------- Research ---------- */
export function demoResearch(topic: string, focus: string, depth: string): DemoOutput {
  const t = topic.trim();
  const words = t.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const f = focus.trim() || "workplace teams";
  const angle = /ai|automation|machine/i.test(t) ? "technology adoption" : /remote|hybrid|work/i.test(t) ? "ways of working" : /market|sales|customer/i.test(t) ? "commercial strategy" : "organisational practice";
  const n = depth === "In-depth" ? 5 : depth === "Brief" ? 2 : 3;
  const insights = [
    `Interest in “${t}” is usually driven by efficiency goals; frame findings around measurable outcomes for ${f}.`,
    `Early adopters in ${angle} typically start with a small pilot before scaling — a useful pattern to test.`,
    `Key stakeholders for ${words[0] ?? "this topic"} often include operations, IT and leadership; align them early.`,
    `Common risks include unclear ownership, data quality and change fatigue.`,
    `Benchmark against at least two peer organisations to validate assumptions.`,
  ].slice(0, n);
  return {
    sections: [
      { title: "Topic overview", text: `${cap(t)} is examined here through the lens of ${angle}, focused on ${f}. This demo overview structures the topic into themes to guide your own research — it does not contain verified facts or live sources.` },
      { title: "Key insights", items: insights },
      { title: "Recommendations", items: [
        `Define 2–3 success metrics for ${t} before investing further.`,
        `Run a 4–6 week pilot with a single team in ${f}.`,
        "Collect qualitative feedback alongside quantitative results.",
        ...(depth === "In-depth" ? ["Create a governance checklist covering privacy, security and ethics."] : []),
      ] },
      { title: "Suggested next searches", items: words.slice(0, 3).map((w) => `“${w}” case studies ${new Date().getFullYear()}`).concat([`${t} best practices`]) },
    ],
  };
}

/* ---------- Chat ---------- */
export function demoChat(msg: string): string {
  const m = msg.toLowerCase();
  if (/^(hi|hello|hey)\b/.test(m)) return "Hello! I'm the demo workplace assistant. Ask me about emails, meetings, planning, focus or research — or open one of the tools in the sidebar.";
  if (/email|reply|message/.test(m)) return "For a strong email: 1) state the purpose in the first line, 2) keep to 3 key points, 3) end with a clear ask and date. Try the Smart Email Generator to draft one in Formal, Friendly or Persuasive tone.";
  if (/meeting|notes|minutes/.test(m)) return "To run effective meetings: share an agenda 24h before, timebox each topic, and end by confirming owners and deadlines. Paste your notes into the Meeting Notes Summarizer to extract decisions and action items.";
  if (/plan|priorit|schedule|todo|task/.test(m)) return "Try the Eisenhower approach: do urgent+important first, schedule important-not-urgent, delegate urgent-not-important, drop the rest. The AI Task Planner can turn your list into a timed schedule.";
  if (/focus|distract|procrastin|productiv/.test(m)) return "Block 90-minute deep-work sessions, silence notifications, and batch email checks to 2–3 times per day. Small wins early in the day build momentum.";
  if (/stress|burnout|overwhelm|tired/.test(m)) return "That sounds tough. Consider listing everything on your plate, picking just the top three, and talking to your manager about priorities. Short breaks and a firm end-of-day help too. If it persists, reach out to a trusted colleague or support service.";
  if (/research|learn|topic|report/.test(m)) return "Start research by defining the question, then gather 3–5 credible sources and note where they agree or differ. The AI Research Assistant can help you structure a topic.";
  return `Here's a demo suggestion about “${msg.slice(0, 60)}”: break it into a clear goal, identify the first small next step, and set a time to do it. (This is a rule-based demo reply — for complex questions, consult a colleague or a verified source.)`;
}
