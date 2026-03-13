import { useEffect, useState } from "react";
import { Star, Trash2, ChevronDown, ChevronUp, Clock, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import MarkdownOutput from "@/components/MarkdownOutput";
import ConfirmDialog from "@/components/ConfirmDialog";
import { listHistory, toggleFavorite, deleteHistory, type HistoryEntry } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

function slugToLabel(slug: string | null): string {
  if (!slug) return "Playground";
  if (slug === "__compare__") return "Experiment Lab";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseCompareData(entry: HistoryEntry): {
  promptA: string;
  promptB: string;
  promptC: string;
  modelA: string;
  modelB: string;
  modelC: string;
  responseA: string;
  responseB: string;
  responseC: string;
} | null {
  if (entry.activity_slug !== "__compare__") return null;
  try {
    const p = JSON.parse(entry.prompt) as { prompt_a: string; prompt_b: string; prompt_c?: string };
    const r = JSON.parse(entry.response) as { response_a: string; response_b: string; response_c?: string };
    const parts = entry.model.split("|||");
    return {
      promptA: p.prompt_a ?? "",
      promptB: p.prompt_b ?? "",
      promptC: p.prompt_c ?? "",
      modelA: parts[0] ?? "",
      modelB: parts[1] ?? "",
      modelC: parts[2] ?? "",
      responseA: r.response_a ?? "No response",
      responseB: r.response_b ?? "No response",
      responseC: r.response_c ?? "",
    };
  } catch {
    return null;
  }
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDeleteConfirm() {
    if (deleteTargetId === null) return;
    setDeleting(true);
    try {
      await deleteHistory(deleteTargetId);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTargetId));
      setExpandedId((prev) => (prev === deleteTargetId ? null : prev));
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = entries
    .filter((e) => !filterFavorites || e.is_favorite)
    .filter((e) =>
      !search.trim() ||
      e.prompt.toLowerCase().includes(search.toLowerCase()) ||
      (e.activity_slug ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.model.toLowerCase().includes(search.toLowerCase())
    );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFilterToggle() {
    setFilterFavorites((v) => !v);
    setPage(1);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-7 py-1.5 w-40 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:w-52 transition-all"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={handleFilterToggle}
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
        <span className="text-sm text-slate-400 dark:text-slate-500">{filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span>
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
          {paginated.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const compareData = parseCompareData(entry);
            const hasCompareC = Boolean(compareData?.promptC || compareData?.modelC || compareData?.responseC);
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
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        entry.activity_slug === null
                          ? "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                          : entry.activity_slug === "__compare__"
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                          : "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30"
                      )}>
                        {slugToLabel(entry.activity_slug)}
                      </span>
                      {compareData ? (
                        <>
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                            {compareData.modelA.split("/").pop()}
                          </span>
                          <span className="text-xs text-slate-400">vs</span>
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                            {compareData.modelB.split("/").pop()}
                          </span>
                          {hasCompareC && (
                            <>
                              <span className="text-xs text-slate-400">vs</span>
                              <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                                {compareData.modelC.split("/").pop()}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                          {entry.model.split("/").pop()}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {new Date(entry.created_at).toLocaleString(undefined, {
                              year: "numeric", month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                      </span>
                    </div>
                    {compareData ? (
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 leading-relaxed">
                          <span className="font-medium text-slate-500 dark:text-slate-400">A:</span> {compareData.promptA}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 leading-relaxed">
                          <span className="font-medium text-slate-500 dark:text-slate-400">B:</span> {compareData.promptB}
                        </p>
                        {hasCompareC && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 leading-relaxed">
                            <span className="font-medium text-slate-500 dark:text-slate-400">C:</span> {compareData.promptC}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {entry.prompt}
                      </p>
                    )}
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
                          entry.is_favorite ? "fill-amber-500 text-amber-500" : "text-slate-400 dark:text-slate-600"
                        )}
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTargetId(entry.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-slate-400 dark:text-slate-600 transition-colors"
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
                    {compareData ? (
                      <div className={cn("grid gap-6", hasCompareC ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">A</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{compareData.modelA.split("/").pop()}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <MarkdownOutput content={compareData.responseA} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">B</span>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{compareData.modelB.split("/").pop()}</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <MarkdownOutput content={compareData.responseB} />
                          </div>
                        </div>
                        {hasCompareC && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">C</span>
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{compareData.modelC.split("/").pop()}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                              <MarkdownOutput content={compareData.responseC || "No response"} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <MarkdownOutput content={entry.response} />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                      p === currentPage
                        ? "bg-violet-600 text-white"
                        : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Delete history entry?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTargetId(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

