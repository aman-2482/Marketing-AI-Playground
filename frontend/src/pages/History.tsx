import { useEffect, useState } from "react";
import { Star, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import MarkdownOutput from "@/components/MarkdownOutput";
import { listHistory, toggleFavorite, deleteHistory, type HistoryEntry } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await listHistory(getSessionId());
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFavorite(entry: HistoryEntry) {
    try {
      const updated = await toggleFavorite(entry.id, !entry.is_favorite);
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteHistory(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = filterFavorites ? entries.filter((e) => e.is_favorite) : entries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Prompt History</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review your past prompts and AI responses. Favorite the best ones for quick reference.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            filterFavorites
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
          )}
        >
          <Star className={cn("w-3.5 h-3.5", filterFavorites && "fill-amber-500 text-amber-500")} />
          {filterFavorites ? "Showing favorites" : "All entries"}
        </button>
        <span className="text-sm text-slate-400 dark:text-slate-500">{filtered.length} entries</span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {filterFavorites ? "No favorites yet" : "No history yet"}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {filterFavorites
              ? "Star prompts you want to keep!"
              : "Start generating content to see your history here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {entry.activity_slug && (
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                          {entry.activity_slug}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {entry.model.split("/").pop()}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {entry.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFavorite(entry); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={entry.is_favorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          entry.is_favorite ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600"
                        )}
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-slate-300 dark:text-slate-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                    )}
                  </div>
                </div>
                {/* Expanded output */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <MarkdownOutput content={entry.response} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

