import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useMatch } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  FlaskConical,
  History,
  Lightbulb,
  Sparkles,
  Home,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard",      end: true  },
  { to: "/playground", icon: Zap,            label: "AI Playground",  end: false },
  { to: "/activities", icon: BookOpen,       label: "Activities",     end: false },
  { to: "/compare",    icon: FlaskConical,   label: "Experiment Lab", end: false },
  { to: "/history",    icon: History,        label: "My History",     end: false },
];

const TIPS = [
  "Be specific about your audience — 'B2B SaaS founders' beats 'business people'.",
  "Give the AI a role: 'You are a senior copywriter at a top agency…'",
  "Specify the format: '3 bullet points', 'under 100 words', etc.",
  "Include brand voice cues: 'witty but professional' shapes tone fast.",
  "Always mention the platform — LinkedIn posts differ from Twitter/X.",
  "Ask for multiple variations, then pick and iterate on the best one.",
  "Add all context upfront: product, audience, goal, and constraints.",
  "Test the same prompt at different temperatures to feel the difference.",
];

function NavItem({ to, icon: Icon, label, end }: (typeof NAV_ITEMS)[number]) {
  const match = useMatch({ path: to, end });
  const isActive = !!match;

  return (
    <NavLink
      to={to}
      end={end}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        isActive
          ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-colors",
          isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        )}
      />
      <span className="flex-1">{label}</span>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
    </NavLink>
  );
}

export default function Layout() {
  const [tipIndex, setTipIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const timer = setInterval(
      () => setTipIndex((i) => (i + 1) % TIPS.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Top Bar ── */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3 flex-shrink-0 z-20">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">GenAI Marketing</span>
          <span className="text-xs text-slate-400 hidden sm:block">· Playground</span>
        </div>

        <nav className="hidden md:flex items-center gap-0.5 ml-4">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Home</span>
          </Link>
        </div>
      </header>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col">
            {/* Brand */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">GenAI Marketing</p>
                  <p className="text-xs text-slate-400">Playground</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Menu
              </p>
              {NAV_ITEMS.map((item) => (
                <div key={item.to} onClick={() => setDrawerOpen(false)}>
                  <NavItem {...item} />
                </div>
              ))}
            </nav>

            {/* Rotating Learning Tips */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/70 dark:border-amber-800/50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">Prompt Tip</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed min-h-[3rem]">
                  {TIPS[tipIndex]}
                </p>
                <div className="flex gap-1 mt-2.5">
                  {TIPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTipIndex(i)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i === tipIndex
                          ? "bg-amber-500"
                          : "bg-amber-200 hover:bg-amber-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
