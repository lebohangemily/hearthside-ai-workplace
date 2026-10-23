import { createFileRoute } from "@tanstack/react-router";
import { demoEmail, type Tone } from "@/lib/demo-ai";
import { useLocalState } from "@/lib/usage";
import { Disclaimer, ErrorNote, Examples, Field, GenerateBar, OutputPanel, PageHeader, useDemoTool } from "@/components/tool-kit";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [
    { title: "Smart Email Generator — AI Workplace Assistant" },
    { name: "description", content: "Draft professional emails in Formal, Friendly or Persuasive tones." },
    { property: "og:title", content: "Smart Email Generator" },
    { property: "og:description", content: "Draft professional emails in seconds with tone control." },
  ] }),
  component: EmailPage,
});

const init = { recipient: "", sender: "", purpose: "", points: "", tone: "Formal" as Tone };

function EmailPage() {
  const [f, setF] = useLocalState("awpa-email", init);
  const t = useDemoTool("email");
  const set = (k: keyof typeof init) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="space-y-6">
      <PageHeader title="Smart Email Generator" description="Describe what you need to say and choose a tone — get a structured draft with a subject line." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-surface space-y-4 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); t.run(() => (f.purpose.trim().length < 4 ? "Please describe the purpose of your email (at least a few words)." : null), () => demoEmail(f), `Email: ${f.purpose}`); }}>
          <Examples items={[
            { label: "Project delay update", apply: () => setF({ recipient: "Mr Naidoo", sender: "Lebohang", purpose: "A two-week delay on the website launch", points: "Supplier integration took longer\nNew launch date is 14 November\nNo impact on budget", tone: "Formal" }) },
            { label: "Team lunch invite", apply: () => setF({ recipient: "team", sender: "Lebohang", purpose: "Team lunch to celebrate Q3 results", points: "Friday at 12:30\nThe Green Café\nReply by Wednesday for dietary needs", tone: "Friendly" }) },
            { label: "Pitch a new tool", apply: () => setF({ recipient: "Thandi", sender: "Lebohang", purpose: "Adopting a shared scheduling tool", points: "Saves ~3 hours per person weekly\nFree 30-day trial\nIntegrates with our calendar", tone: "Persuasive" }) },
          ]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name" id="rec"><input id="rec" className="field" value={f.recipient} onChange={set("recipient")} placeholder="e.g. Ms Dlamini" /></Field>
            <Field label="Your name" id="snd"><input id="snd" className="field" value={f.sender} onChange={set("sender")} placeholder="e.g. Lebohang" /></Field>
          </div>
          <Field label="Purpose *" id="pur"><input id="pur" className="field" value={f.purpose} onChange={set("purpose")} placeholder="e.g. Follow-up on yesterday's proposal" /></Field>
          <Field label="Key points" id="pts" hint="One point per line."><textarea id="pts" rows={4} className="field" value={f.points} onChange={set("points")} /></Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">Tone</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["Formal", "Friendly", "Persuasive"] as Tone[]).map((tone) => (
                <label key={tone} className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors ${f.tone === tone ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                  <input type="radio" name="tone" value={tone} checked={f.tone === tone} onChange={() => setF({ ...f, tone })} className="sr-only" />{tone}
                </label>
              ))}
            </div>
          </fieldset>
          <ErrorNote error={t.error} />
          <GenerateBar loading={t.loading} onClear={() => { setF(init); t.reset(); }} />
        </form>
        <OutputPanel output={t.output} loading={t.loading} onClear={t.reset} />
      </div>
      <Disclaimer />
    </div>
  );
}
