import { createFileRoute } from "@tanstack/react-router";
import { demoPlan } from "@/lib/demo-ai";
import { useLocalState } from "@/lib/usage";
import { Disclaimer, ErrorNote, Examples, Field, GenerateBar, OutputPanel, PageHeader, useDemoTool } from "@/components/tool-kit";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [
    { title: "AI Task Planner — AI Workplace Assistant" },
    { name: "description", content: "Turn your to-do list into a prioritised daily or weekly schedule." },
    { property: "og:title", content: "AI Task Planner" },
    { property: "og:description", content: "Prioritised daily and weekly schedules from your task list." },
  ] }),
  component: PlannerPage,
});

const init = { tasks: "", period: "Daily" as "Daily" | "Weekly", start: 8 };

function PlannerPage() {
  const [f, setF] = useLocalState("awpa-planner", init);
  const t = useDemoTool("planner");
  return (
    <div className="space-y-6">
      <PageHeader title="AI Task Planner" description="List your tasks (add durations like “2h” or “30m”). Get priorities and a realistic schedule." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-surface space-y-4 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); t.run(() => (f.tasks.split("\n").filter((l) => l.trim()).length < 2 ? "Please enter at least two tasks, one per line." : null), () => demoPlan(f.tasks, f.period, f.start), `${f.period} plan: ${f.tasks.split("\n").filter(Boolean).length} tasks`); }}>
          <Examples items={[
            { label: "Busy Monday", apply: () => setF({ tasks: "Finish client proposal (urgent) 2h\nReply to emails 30m\nReview Q3 report 1h\nTeam stand-up meeting 15m\nUpdate project tracker 30m\nRead industry newsletter 20m", period: "Daily", start: 8 }) },
            { label: "Weekly launch prep", apply: () => setF({ tasks: "Prepare launch deck for CEO 3h\nClient demo rehearsal 2h\nWrite release notes 1h\nReview QA results 2h\nUpdate website copy 90m\nPlan team retrospective 45m\nOrganise shared drive 1h", period: "Weekly", start: 9 }) },
          ]} />
          <Field label="Tasks *" id="tasks" hint="One task per line. Words like “urgent”, “client” or “due” raise priority.">
            <textarea id="tasks" rows={9} className="field" value={f.tasks} onChange={(e) => setF({ ...f, tasks: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Plan type" id="period">
              <select id="period" className="field" value={f.period} onChange={(e) => setF({ ...f, period: e.target.value as "Daily" | "Weekly" })}><option>Daily</option><option>Weekly</option></select>
            </Field>
            <Field label="Day starts at" id="start">
              <select id="start" className="field" value={f.start} onChange={(e) => setF({ ...f, start: Number(e.target.value) })}>
                {[6, 7, 8, 9, 10].map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </Field>
          </div>
          <ErrorNote error={t.error} />
          <GenerateBar loading={t.loading} onClear={() => { setF(init); t.reset(); }} />
        </form>
        <OutputPanel output={t.output} loading={t.loading} onClear={t.reset} />
      </div>
      <Disclaimer />
    </div>
  );
}
