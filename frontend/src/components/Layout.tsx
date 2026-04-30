import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  FlaskConical,
  History,
  Lightbulb,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthUser, clearAuthUser, setAuthUser, type AuthUser } from "@/lib/auth";
import { sendTrialPing } from "@/lib/api";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/playground", icon: Zap, label: "AI Playground", end: false },
  { to: "/activities", icon: BookOpen, label: "Activities", end: false },
  { to: "/compare", icon: FlaskConical, label: "Experiment Lab", end: false },
  { to: "/history", icon: History, label: "My History", end: false },
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

function sectionKey(to: string) {
  return `last_path_${to}`;
}
function saveLastPath(navTo: string, currentPath: string) {
  sessionStorage.setItem(sectionKey(navTo), currentPath);
}
function getLastPath(navTo: string): string {
  return sessionStorage.getItem(sectionKey(navTo)) || navTo;
}

function NavItem({ to, icon: Icon, label, end }: (typeof NAV_ITEMS)[number]) {
  const match = useMatch({ path: to, end });
  const isActive = !!match;
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick(e: React.MouseEvent) {
    if (location.pathname.startsWith(to)) return;
    const saved = getLastPath(to);
    if (saved !== to) {
      e.preventDefault();
      navigate(saved);
    }
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={handleClick}
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

function TrialTimer({ authUser }: { authUser: AuthUser }) {
  const navigate = useNavigate();
  const maxSeconds = authUser.trialMinutes * 60;
  const [usedSeconds, setUsedSeconds] = useState(authUser.trialSecondsUsed);
  const remaining = Math.max(0, maxSeconds - usedSeconds);
  const isUrgent = remaining < 60;

  if (authUser.username === "admin") return null;

  useEffect(() => {
    if (remaining === 0) {
      clearAuthUser();
      navigate("/subscription", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setUsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining, navigate]);

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        try {
          const res = await sendTrialPing(10);
          if (res.expired) {
            clearAuthUser();
            navigate("/subscription", { replace: true });
          } else {
            setUsedSeconds(res.trial_seconds_used);
            const currentUser = getAuthUser();
            if (currentUser) {
              currentUser.trialSecondsUsed = res.trial_seconds_used;
              setAuthUser(currentUser);
            }
          }
        } catch (e) {
          // Ignore network errors on ping
        }
      }
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [navigate]);

  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className={cn(
      "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors",
      isUrgent 
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse" 
        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold font-mono">{m}:{s}</span>
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const matchingNav = NAV_ITEMS.find((item) =>
      location.pathname.startsWith(item.to) && item.to !== "/dashboard"
    );
    if (matchingNav) {
      saveLastPath(matchingNav.to, location.pathname);
    }
  }, [location.pathname]);

  const authUser = getAuthUser();

  const [tipIndex, setTipIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setUserDialogOpen(false);
      }
    };
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
              onClick={(e) => {
                if (location.pathname.startsWith(to)) return;
                const saved = getLastPath(to);
                if (saved !== to) { e.preventDefault(); navigate(saved); }
              }}
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

          {/* Trial Timer */}
          {authUser && <TrialTimer authUser={authUser} />}

          {/* User info */}
          {authUser && (
            <button
              type="button"
              onClick={() => setUserDialogOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{authUser.username}</span>
            </button>
          )}
        </div>
      </header>

      {/* User Dialog */}
      {userDialogOpen && authUser && (
        <>
          <div
            className="fixed inset-0 bg-black/35 z-40"
            onClick={() => setUserDialogOpen(false)}
          />
          <div className="fixed z-50 top-16 right-4 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{authUser.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Signed in</p>
              </div>
            </div>
            <button
              onClick={() => {
                setUserDialogOpen(false);
                clearAuthUser();
                navigate("/");
              }}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

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

              {authUser && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      clearAuthUser();
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-all"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
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
