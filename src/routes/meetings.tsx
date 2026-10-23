import { createFileRoute } from "@tanstack/react-router";
import { demoMeeting } from "@/lib/demo-ai";
import { useLocalState } from "@/lib/usage";
import { Disclaimer, ErrorNote, Examples, Field, GenerateBar, OutputPanel, PageHeader, useDemoTool } from "@/components/tool-kit";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [
    { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
    { name: "description", content: "Turn raw meeting notes into a summary, decisions, action items and deadlines." },
    { property: "og:title", content: "Meeting Notes Summarizer" },
    { property: "og:description", content: "Extract decisions, actions and deadlines from meeting notes." },
  ] }),
  component: MeetingsPage,
});

const EX1 = `Weekly marketing sync with Sarah, James and Lindiwe.
Reviewed Q4 campaign performance; email open rates are up 12%.
We agreed to shift 20% of the social budget to video content.
Sarah will prepare the revised budget by Friday.
James needs to send the agency brief before next week.
Decided to pause the podcast sponsorship until January.
Lindiwe should follow up with the design team on new banners by Wednesday.`;
const EX2 = `Product planning call. Discussed customer feedback on the mobile app.
Login issues were the top complaint. The team approved a hotfix release.
Thabo will fix the login bug by tomorrow.
Anna to update the help centre article by end of week.
Next sprint will focus on onboarding improvements.`;

function MeetingsPage() {
  const [notes, setNotes] = useLocalState("awpa-meeting", "");
  const t = useDemoTool("meetings");
  return (
    <div className="space-y-6">
      <PageHeader title="Meeting Notes Summarizer" description="Paste rough notes or a transcript. Get a summary, key decisions, action items and deadlines." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card-surface space-y-4 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); t.run(() => (notes.trim().length < 30 ? "Please paste at least a few sentences of meeting notes." : null), () => demoMeeting(notes), `Meeting: ${notes.split("\n")[0]}`); }}>
          <Examples items={[{ label: "Marketing sync", apply: () => setNotes(EX1) }, { label: "Product planning call", apply: () => setNotes(EX2) }]} />
          <Field label="Meeting notes *" id="notes" hint={`${notes.length} characters · Tip: phrases like “agreed”, “will” and “by Friday” improve extraction.`}>
            <textarea id="notes" rows={12} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your notes here…" />
          </Field>
          <ErrorNote error={t.error} />
          <GenerateBar loading={t.loading} onClear={() => { setNotes(""); t.reset(); }} />
        </form>
        <OutputPanel output={t.output} loading={t.loading} onClear={t.reset} />
      </div>
      <Disclaimer />
    </div>
  );
}
