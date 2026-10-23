import { useState, type ReactNode } from "react";
import { Copy, Check, Trash2, Loader2, Sparkles, AlertCircle, ShieldAlert, Lightbulb } from "lucide-react";
import { sectionsToText, wait, type DemoOutput } from "@/lib/demo-ai";
import { recordUsage, type ToolKey } from "@/lib/usage";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div role="note" className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <p><strong>Responsible AI:</strong> This tool runs in demo mode — responses are rule-based templates built from your input, not a real AI model. Verify every output before using it, and don't enter confidential, personal or client information.</p>
    </div>
  );
}

export function Field({ label, id, children, hint }: { label: string; id: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Examples({ items, onPick }: { items: { label: string; apply: () => void }[]; onPick?: () => void }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Lightbulb className="h-3.5 w-3.5" /> Try an example</p>
      <div className="flex flex-wrap gap-2">
        {items.map((e) => (
          <button key={e.label} type="button" onClick={() => { e.apply(); onPick?.(); }}
            className="rounded-full border bg-cream px-3 py-1.5 text-xs font-medium hover:border-fawn hover:bg-secondary">{e.label}</button>
        ))}
      </div>
    </div>
  );
}

export function useDemoTool(tool: ToolKey) {
  const [output, setOutput] = useState<DemoOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(validate: () => string | null, gen: () => DemoOutput, label: string) {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null); setLoading(true);
    try {
      await wait();
      setOutput(gen());
      recordUsage(tool, label);
    } catch {
      setError("Something went wrong while generating. Please try again.");
    } finally { setLoading(false); }
  }
  return { output, loading, error, run, reset: () => { setOutput(null); setError(null); } };
}

export function GenerateBar({ loading, onClear }: { loading: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {loading ? "Generating…" : "Generate"}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onClear} disabled={loading}><Trash2 className="h-4 w-4" /> Clear</button>
    </div>
  );
}

export function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="alert" className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {error}</p>;
}

export function OutputPanel({ output, loading, onClear }: { output: DemoOutput | null; loading: boolean; onClear: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(sectionsToText(output)); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };
  return (
    <section aria-live="polite" aria-busy={loading} className="card-surface flex min-h-[320px] flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl">Output</h2>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">Demo response</span>
        {output && !loading && (
          <div className="ml-auto flex gap-1">
            <button onClick={copy} className="btn btn-ghost px-3 py-1.5 text-xs" aria-label="Copy output">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}</button>
            <button onClick={onClear} className="btn btn-ghost px-3 py-1.5 text-xs" aria-label="Clear output"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[80, 95, 60, 88, 70].map((w, i) => <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}
          <p className="pt-2 text-sm text-muted-foreground">Preparing your demo response…</p>
        </div>
      ) : output ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {output.sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-1.5 font-sans text-xs font-bold uppercase tracking-wider text-fawn">{s.title}</h3>
              {s.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{s.text}</p>}
              {s.items && <ul className="space-y-1.5">{s.items.map((it, i) => <li key={i} className="flex gap-2 text-sm leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fawn" />{it}</li>)}</ul>}
            </div>
          ))}
        </div>
      ) : (
        <div className="m-auto max-w-xs text-center text-sm text-muted-foreground">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-fawn" />
          Fill in the form or pick an example, then press <strong>Generate</strong>.
        </div>
      )}
    </section>
  );
}
