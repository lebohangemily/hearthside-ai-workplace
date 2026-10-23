import { createFileRoute } from "@tanstack/react-router";
import { demoResearch } from "@/lib/demo-ai";
import { useLocalState } from "@/lib/usage";
import { Disclaimer, ErrorNote, Examples, Field, GenerateBar, OutputPanel, PageHeader, useDemoTool } from "@/components/tool-kit";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [
    { title: "AI Research Assistant — AI Workplace Assistant" },
    { name: "description", content: "Structure any workplace topic into a summary, insights and recommendations." },
    { property: "og:title", content: "AI Research Assistant" },
    { property: "og:description", content: "Topic summaries, insights and recommendations for professionals." },
  ] }),
  component: ResearchPage,
});

const init = { topic: "", focus: "", depth: "Standard" };

function ResearchPage() {
  const [f, setF] = useLocalState("awpa-research", init);
  const t = useDemoTool("research");
  return (
    <div className="space-y-6">
      <PageHeader title="AI Research Assistant" description="Enter a topic and audience. Get a structured overview, insights, recommendations and next searches." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-surface space-y-4 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); t.run(() => (f.topic.trim().length < 3 ? "Please enter a research topic." : null), () => demoResearch(f.topic, f.focus, f.depth), `Research: ${f.topic}`); }}>
          <Examples items={[
            { label: "AI in customer service", apply: () => setF({ topic: "AI automation in customer service", focus: "a mid-sized support team", depth: "Standard" }) },
            { label: "Hybrid work policies", apply: () => setF({ topic: "Hybrid work policies and productivity", focus: "HR leaders", depth: "In-depth" }) },
            { label: "Customer retention", apply: () => setF({ topic: "Customer retention strategies for SaaS", focus: "sales and success teams", depth: "Brief" }) },
          ]} />
          <Field label="Topic *" id="topic"><input id="topic" className="field" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} placeholder="e.g. Four-day work week" /></Field>
          <Field label="Audience / focus" id="focus"><input id="focus" className="field" value={f.focus} onChange={(e) => setF({ ...f, focus: e.target.value })} placeholder="e.g. finance department" /></Field>
          <Field label="Depth" id="depth">
            <select id="depth" className="field" value={f.depth} onChange={(e) => setF({ ...f, depth: e.target.value })}><option>Brief</option><option>Standard</option><option>In-depth</option></select>
          </Field>
          <ErrorNote error={t.error} />
          <GenerateBar loading={t.loading} onClear={() => { setF(init); t.reset(); }} />
        </form>
        <OutputPanel output={t.output} loading={t.loading} onClear={t.reset} />
      </div>
      <Disclaimer />
    </div>
  );
}
