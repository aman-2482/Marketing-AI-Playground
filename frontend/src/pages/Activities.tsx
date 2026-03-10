import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { listActivities, type Activity } from "@/lib/api";
import { ICON_MAP, DEFAULT_ICON } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    listActivities().then(setActivities).catch(console.error);
  }, []);

  const categories = ["All", ...new Set(activities.map((a) => a.category))];
  const filtered =
    filter === "All" ? activities : activities.filter((a) => a.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Guided Activities</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Structured exercises with objectives, instructions, tips, and pre-filled examples.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filter === cat
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((activity) => (
          <Link
            key={activity.slug}
            to={`/activities/${activity.slug}`}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all flex flex-col"
          >
            <div className="text-2xl mb-3">
              {ICON_MAP[activity.icon as keyof typeof ICON_MAP] ?? DEFAULT_ICON}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
              {activity.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed flex-1 line-clamp-3">
              {activity.description}
            </p>
            <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-violet-500 group-hover:gap-2 transition-all">
              Start <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
