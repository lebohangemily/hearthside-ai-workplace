import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Mail, NotebookPen, CalendarCheck, Search, MessageCircle, PanelLeftClose, PanelLeftOpen, Menu, X, Sparkles, Bell } from "lucide-react";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "Workplace Chat", icon: MessageCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => setMobileOpen(false), [path]);
  const current = NAV.find((n) => n.to === path)?.label ?? "Dashboard";

  const nav = (mini: boolean) => (
    <nav aria-label="Main" className="flex flex-col gap-1 px-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = path === to;
        return (
          <Link key={to} to={to} title={mini ? label : undefined} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-fawn text-espresso" : "text-espresso-foreground/75 hover:bg-espresso-foreground/10 hover:text-espresso-foreground"} ${mini ? "justify-center" : ""}`}>
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
            {!mini && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (mini: boolean) => (
    <div className={`flex items-center gap-2.5 px-5 py-6 ${mini ? "justify-center px-0" : ""}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-fawn text-espresso"><Sparkles className="h-5 w-5" aria-hidden /></div>
      {!mini && <div className="leading-tight"><p className="font-display text-lg text-espresso-foreground">Workplace AI</p><p className="text-[11px] uppercase tracking-widest text-espresso-foreground/55">Productivity Assistant</p></div>}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-espresso transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-64"}`}>
        {brand(collapsed)}
        {nav(collapsed)}
        <div className="mt-auto p-3">
          <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-espresso-foreground/70 hover:bg-espresso-foreground/10">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-espresso/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-espresso animate-in slide-in-from-left duration-200">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-6 rounded-lg p-1.5 text-espresso-foreground/70 hover:bg-espresso-foreground/10"><X className="h-5 w-5" /></button>
            {brand(false)}
            {nav(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-secondary lg:hidden"><Menu className="h-5 w-5" /></button>
          <h2 className="truncate font-display text-lg">{current}</h2>
          <span className="ml-auto hidden rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-foreground sm:inline">Demo mode · no real AI</span>
          <button aria-label="Notifications" className="rounded-lg p-2 hover:bg-secondary"><Bell className="h-5 w-5" /></button>
          <div aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full bg-fawn text-sm font-bold text-espresso">LE</div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
          Responsible AI: outputs are illustrative demo responses. Always verify before use and never enter confidential workplace information.
        </footer>
      </div>
    </div>
  );
}
