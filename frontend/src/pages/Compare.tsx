import { useRef, useState, useEffect } from "react";
import { GitCompare, Clock, ChevronDown, ChevronUp, Star, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import MarkdownOutput from "@/components/MarkdownOutput";
import ModelSelector from "@/components/ModelSelector";
import ConfirmDialog from "@/components/ConfirmDialog";
import { comparePromptsStream, listHistory, toggleFavorite, deleteHistory, type HistoryEntry } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

interface PastComparison {
  id: number;
  promptA: string;
  promptB: string;
  promptC: string;
  outputA: string;
  outputB: string;
  outputC: string;
  modelA: string;
  modelB: string;
  modelC: string;
  timestamp: string;
  isFavorite: boolean;
}

function parseCompareEntry(entry: HistoryEntry): PastComparison | null {
  try {
    const p = JSON.parse(entry.prompt) as {
      prompt_a: string;
      prompt_b: string;
      prompt_c?: string;
    };
    const r = JSON.parse(entry.response) as {
      response_a: string;
      response_b: string;
      response_c?: string;
    };
    const parts = entry.model.split("|||");
    return {
      id: entry.id,
      promptA: p.prompt_a ?? "",
      promptB: p.prompt_b ?? "",
      promptC: p.prompt_c ?? "",
      outputA: r.response_a ?? "",
      outputB: r.response_b ?? "",
      outputC: r.response_c ?? "",
      modelA: parts[0] ?? "",
      modelB: parts[1] ?? "",
      modelC: parts[2] ?? "",
      timestamp: new Date(entry.created_at).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      isFavorite: entry.is_favorite,
    };
  } catch {
    return null;
  }
}

const EXPERIMENTS = [
  {
    title: "Specificity",
    description: "Vague vs. detailed vs. constrained prompt",
    prompt_a: "Write a product description for headphones.",
    prompt_b:
      "You are a premium audio brand copywriter. Write a 150-word product description for wireless noise-canceling headphones targeting remote professionals. Highlight: comfort for all-day wear, 40-hour battery, and crystal-clear call quality. Use a confident but warm tone.",
    prompt_c:
      "You are a conversion copywriter for a premium audio brand. Write exactly 3 short paragraphs for wireless noise-canceling headphones aimed at remote professionals. Mention only: all-day comfort, 40-hour battery, and call clarity. Keep total length under 120 words. End with a one-line CTA.",
  },
  {
    title: "Role",
    description: "No role vs. persona vs. channel strategist",
    prompt_a: "Write an Instagram caption for a new coffee blend.",
    prompt_b:
      "You are a social media manager for a trendy specialty coffee brand with a playful, adventurous personality. Write an Instagram caption for a new single-origin Ethiopian coffee blend. Include emojis and relevant hashtags.",
    prompt_c:
      "You are a growth-focused social strategist. Create an Instagram launch caption for a new single-origin Ethiopian coffee blend with this format: 1 hook line, 2 sensory benefit lines, 1 social proof line, and 1 CTA line. Add 5 targeted hashtags.",
  },
  {
    title: "Format",
    description: "Open-ended vs. structured vs. strict template",
    prompt_a: "Create a marketing email for a fitness app.",
    prompt_b:
      "Create a marketing email for a fitness app. Structure it as: 1) Subject line (under 50 chars) 2) Preview text (under 100 chars) 3) Opening hook 4) Three key benefits with icons 5) Social proof quote 6) CTA button text 7) P.S. line",
    prompt_c:
      "Create a marketing email for a fitness app using this exact template: Subject (max 45 chars), Preview (max 90 chars), Intro (2 sentences), Benefit bullets (3 bullets, each under 12 words), Testimonial (1 sentence), CTA (3 words), P.S. (1 sentence). Tone: motivating, not pushy.",
  },
  {
    title: "Audience",
    description: "Generic vs. targeted vs. segmented audience",
    prompt_a: "Write ad copy for an online learning platform.",
    prompt_b:
      "Write Google Ads copy for an online learning platform targeting mid-career professionals (35-45) who feel stuck and want to upskill in AI/data science. Address their fear of being left behind and desire for career growth.",
    prompt_c:
      "Write 3 Google ad variants for an online learning platform targeting mid-career professionals (35-45). Variant 1 should address job-security anxiety, Variant 2 should address salary growth, and Variant 3 should address confidence rebuilding. Include headline and description for each.",
  },
];

const LANE_STYLES = {
  A: {
    chip: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    badge: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30",
    label: "text-violet-600 dark:text-violet-400",
  },
  B: {
    chip: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
    label: "text-emerald-600 dark:text-emerald-400",
  },
  C: {
    chip: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    badge: "text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30",
    label: "text-amber-600 dark:text-amber-300",
  },
} as const;

export default function Compare() {
  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const [promptC, setPromptC] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful marketing assistant."
  );
  const [temperature, setTemperature] = useState(0.7);
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [modelC, setModelC] = useState("");
  const [outputA, setOutputA] = useState("");
  const [outputB, setOutputB] = useState("");
  const [outputC, setOutputC] = useState("");
  const [usedModelA, setUsedModelA] = useState("");
  const [usedModelB, setUsedModelB] = useState("");
  const [usedModelC, setUsedModelC] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [pastComparisons, setPastComparisons] = useState<PastComparison[]>([]);
  const [expandedPastId, setExpandedPastId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { void loadCompareHistory(); }, []);

  async function loadCompareHistory() {
    try {
      const all = await listHistory(getSessionId(), 100);
      const parsed = all
        .filter((e) => e.activity_slug === "__compare__")
        .map(parseCompareEntry)
        .filter((e): e is PastComparison => e !== null);
      setPastComparisons(parsed);
    } catch {
      // non-critical
    }
  }

  async function handleFavorite(past: PastComparison) {
    try {
      const updated = await toggleFavorite(past.id, !past.isFavorite);
      setPastComparisons((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, isFavorite: updated.is_favorite } : e))
      );
    } catch {
      // ignore
    }
  }

  async function handleDeleteConfirm() {
    if (deleteTargetId === null) return;
    setDeleting(true);
    try {
      await deleteHistory(deleteTargetId);
      setPastComparisons((prev) => prev.filter((e) => e.id !== deleteTargetId));
      setExpandedPastId((prev) => (prev === deleteTargetId ? null : prev));
      setDeleteTargetId(null);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  async function handleCompare() {
    if (!promptA.trim() || !promptB.trim() || !promptC.trim()) return;
    setLoading(true);
    setError("");
    setOutputA("");
    setOutputB("");
    setOutputC("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await comparePromptsStream({
        prompt_a: promptA,
        prompt_b: promptB,
        prompt_c: promptC,
        system_prompt: systemPrompt,
        temperature,
        session_id: getSessionId(),
        model_a: modelA,
        model_b: modelB,
        model_c: modelC,
      }, ({ lane, chunk }) => {
        if (lane === "a") setOutputA((prev) => prev + chunk);
        if (lane === "b") setOutputB((prev) => prev + chunk);
        if (lane === "c") setOutputC((prev) => prev + chunk);
      }, ({ model_a, model_b, model_c }) => {
        setUsedModelA(model_a);
        setUsedModelB(model_b);
        setUsedModelC(model_c ?? "");
      }, controller.signal);
      await loadCompareHistory();
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Comparison stopped");
      } else {
        setError(err instanceof Error ? err.message : "Comparison failed");
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  function handleStopCompare() {
    abortRef.current?.abort();
  }

  function loadExperiment(exp: (typeof EXPERIMENTS)[number]) {
    setPromptA(exp.prompt_a);
    setPromptB(exp.prompt_b);
    setPromptC(exp.prompt_c);
    setOutputA("");
    setOutputB("");
    setOutputC("");
  }

  const canCompare = !loading && promptA.trim().length > 0 && promptB.trim().length > 0 && promptC.trim().length > 0;

  const hasOutput = Boolean(outputA || outputB || outputC);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Experiment Lab</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Compare three prompts A, B, and C side-by-side, then slide horizontally between lanes to spot what changes quality.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Try a Pre-built Experiment</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPERIMENTS.map((exp) => (
            <button
              key={exp.title}
              onClick={() => loadExperiment(exp)}
              className={cn(
                "text-left p-3 rounded-xl border transition-all",
                promptA === exp.prompt_a
                  ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{exp.title} Test</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{exp.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", LANE_STYLES.A.chip)}>A</span>
              Prompt A
            </span>
            <Textarea
              value={promptA}
              onChange={(e) => setPromptA(e.target.value)}
              rows={8}
              className="resize-none"
              placeholder="Write your first prompt version"
            />
            <ModelSelector label="Model A" value={modelA} onChange={setModelA} />
          </div>

          <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", LANE_STYLES.B.chip)}>B</span>
              Prompt B
            </span>
            <Textarea
              value={promptB}
              onChange={(e) => setPromptB(e.target.value)}
              rows={8}
              className="resize-none"
              placeholder="Write your second prompt version"
            />
            <ModelSelector label="Model B" value={modelB} onChange={setModelB} />
          </div>

          <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold", LANE_STYLES.C.chip)}>C</span>
              Prompt C
            </span>
            <Textarea
              value={promptC}
              onChange={(e) => setPromptC(e.target.value)}
              rows={8}
              className="resize-none"
              placeholder="Write your third prompt version"
            />
            <ModelSelector label="Model C" value={modelC} onChange={setModelC} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              System Prompt
            </p>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>
          <div className="w-full sm:w-48 space-y-2">
            <div className="flex justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Creativity
              </p>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <button
            onClick={loading ? handleStopCompare : handleCompare}
            disabled={!loading && !canCompare}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0",
              loading
                ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                : canCompare
                  ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <GitCompare className="w-4 h-4" />
            {loading ? "Stop" : "Compare A/B/C"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {hasOutput && (
        <div ref={outputRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Outputs</p>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", LANE_STYLES.A.chip)}>
                  A
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Output A</p>
                {usedModelA && (
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                    {usedModelA.split("/").pop()}
                  </span>
                )}
              </div>
              <MarkdownOutput content={outputA} />
            </div>

            <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", LANE_STYLES.B.chip)}>
                  B
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Output B</p>
                {usedModelB && (
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                    {usedModelB.split("/").pop()}
                  </span>
                )}
              </div>
              <MarkdownOutput content={outputB} />
            </div>

            <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", LANE_STYLES.C.chip)}>
                  C
                </span>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Output C</p>
                {usedModelC && (
                  <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                    {usedModelC.split("/").pop()}
                  </span>
                )}
              </div>
              <MarkdownOutput content={outputC} />
            </div>
          </div>
        </div>
      )}

      {pastComparisons.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Past Comparisons</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {pastComparisons.length}
            </span>
          </div>
          <div className="space-y-2">
            {pastComparisons.map((past) => {
              const isExpanded = expandedPastId === past.id;
              const hasC = Boolean(past.promptC || past.outputC || past.modelC);
              return (
                <div key={past.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedPastId(isExpanded ? null : past.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {past.modelA && (
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", LANE_STYLES.A.badge)}>
                            A: {past.modelA.split("/").pop()}
                          </span>
                        )}
                        {past.modelB && (
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", LANE_STYLES.B.badge)}>
                            B: {past.modelB.split("/").pop()}
                          </span>
                        )}
                        {past.modelC && (
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", LANE_STYLES.C.badge)}>
                            C: {past.modelC.split("/").pop()}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500">{past.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        <span className={cn("font-medium", LANE_STYLES.A.label)}>A:</span> {past.promptA}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); void handleFavorite(past); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={past.isFavorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star className={cn("w-3.5 h-3.5", past.isFavorite ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-600")} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(past.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-slate-300 dark:text-slate-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
                        <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className={cn("text-xs font-semibold mb-2", LANE_STYLES.A.label)}>Output A</p>
                          <MarkdownOutput content={past.outputA} />
                        </div>
                        <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
                          <p className={cn("text-xs font-semibold mb-2", LANE_STYLES.B.label)}>Output B</p>
                          <MarkdownOutput content={past.outputB} />
                        </div>
                        {hasC && (
                          <div className="min-w-[85%] sm:min-w-[60%] lg:min-w-[32%] snap-start px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className={cn("text-xs font-semibold mb-2", LANE_STYLES.C.label)}>Output C</p>
                            <MarkdownOutput content={past.outputC} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
