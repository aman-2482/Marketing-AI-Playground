import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Search, X } from "lucide-react";
import { listActivities, type Activity } from "@/lib/api";
import { ICON_MAP, DEFAULT_ICON, cn } from "@/lib/utils";
import { getCompletedActivitiesSynced } from "@/lib/progress";

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    listActivities().then((data) => {
      if (isMounted) setActivities(data);
    }).catch(console.error);
    getCompletedActivitiesSynced().then((completed) => {
      if (isMounted) setCompletedSlugs(completed);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ["All", ...new Set(activities.map((a) => a.category))];
  const filtered = activities
    .filter((a) => filter === "All" || a.category === filter)
    .filter((a) =>
      !search.trim() ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Guided Activities</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Structured exercises with objectives, instructions, tips, and pre-filled examples.
            </p>
          </div>
          {activities.length > 0 && (
            <div className="text-left sm:text-right shrink-0 sm:ml-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {completedSlugs.size}/{activities.length} completed
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">skill progress</p>
            </div>
          )}
        </div>
        {activities.length > 0 && (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                style={{ width: `${(completedSlugs.size / activities.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Search + Category filter row */}
      <div className="space-y-2">
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-7 py-1.5 w-full sm:w-52 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                filter === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-2">
          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No activities found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Try a different search term or category</p>
        </div>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((activity) => (
          <Link
            key={activity.slug}
            to={`/activities/${activity.slug}`}
            className={cn(
              "group bg-white dark:bg-slate-900 border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col relative",
              completedSlugs.has(activity.slug)
                ? "border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                : "border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800"
            )}
          >
            {completedSlugs.has(activity.slug) && (
              <CheckCircle2 className="absolute top-3.5 right-3.5 w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            )}
            <div className="text-2xl mb-3">
              {ICON_MAP[activity.icon as keyof typeof ICON_MAP] ?? DEFAULT_ICON}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
              {activity.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed flex-1 line-clamp-3">
              {activity.description}
            </p>
            <div className={cn(
              "flex items-center gap-1 mt-4 text-xs font-semibold group-hover:gap-2 transition-all",
              completedSlugs.has(activity.slug) ? "text-emerald-500" : "text-violet-500"
            )}>
              <span className="leading-none">{completedSlugs.has(activity.slug) ? "Redo" : "Start"}</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
