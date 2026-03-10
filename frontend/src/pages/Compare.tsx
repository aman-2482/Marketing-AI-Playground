import { useState } from "react";
import { GitCompare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import MarkdownOutput from "@/components/MarkdownOutput";
import ModelSelector from "@/components/ModelSelector";
import { comparePrompts } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

const EXPERIMENTS = [
  {
    title: "Specificity",
    description: "Vague vs. detailed prompt",
    prompt_a: "Write a product description for headphones.",
    prompt_b:
      "You are a premium audio brand copywriter. Write a 150-word product description for wireless noise-canceling headphones targeting remote professionals. Highlight: comfort for all-day wear, 40-hour battery, and crystal-clear call quality. Use a confident but warm tone.",
  },
  {
    title: "Role",
    description: "No role vs. expert persona",
    prompt_a: "Write an Instagram caption for a new coffee blend.",
    prompt_b:
      "You are a social media manager for a trendy specialty coffee brand with a playful, adventurous personality. Write an Instagram caption for a new single-origin Ethiopian coffee blend. Include emojis and relevant hashtags.",
  },
  {
    title: "Format",
    description: "Open-ended vs. structured output",
    prompt_a: "Create a marketing email for a fitness app.",
    prompt_b:
      "Create a marketing email for a fitness app. Structure it as: 1) Subject line (under 50 chars) 2) Preview text (under 100 chars) 3) Opening hook 4) Three key benefits with icons 5) Social proof quote 6) CTA button text 7) P.S. line",
  },
  {
    title: "Audience",
    description: "Generic vs. targeted audience",
    prompt_a: "Write ad copy for an online learning platform.",
    prompt_b:
      "Write Google Ads copy for an online learning platform targeting mid-career professionals (35-45) who feel stuck and want to upskill in AI/data science. Address their fear of being left behind and desire for career growth.",
  },
];

export default function Compare() {
  const [promptA, setPromptA] = useState("");
  const [promptB, setPromptB] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful marketing assistant."
  );
  const [temperature, setTemperature] = useState(0.7);
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [outputA, setOutputA] = useState("");
  const [outputB, setOutputB] = useState("");
  const [usedModelA, setUsedModelA] = useState("");
  const [usedModelB, setUsedModelB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompare() {
    if (!promptA.trim() || !promptB.trim()) return;
    setLoading(true);
    setError("");
    setOutputA("");
    setOutputB("");
    try {
      const result = await comparePrompts({
        prompt_a: promptA,
        prompt_b: promptB,
        system_prompt: systemPrompt,
        temperature,
        session_id: getSessionId(),
        model_a: modelA,
        model_b: modelB,
      });
      setOutputA(result.response_a);
      setOutputB(result.response_b);
      setUsedModelA(result.model_a);
      setUsedModelB(result.model_b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  function loadExperiment(exp: (typeof EXPERIMENTS)[number]) {
    setPromptA(exp.prompt_a);
    setPromptB(exp.prompt_b);
    setOutputA("");
    setOutputB("");
  }

  const canCompare = !loading && promptA.trim().length > 0 && promptB.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Experiment Lab</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Compare two prompts or two models side-by-side. The fastest way to develop
          prompt engineering intuition.
        </p>
      </div>

      {/* Pre-built experiments */}
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

      {/* Side-by-side input */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Prompt A */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center justify-center text-xs font-bold">A</span>
              Prompt A
            </span>
          </div>
          <Textarea
            value={promptA}
            onChange={(e) => setPromptA(e.target.value)}
            rows={6}
            className="resize-none"
            placeholder="Write your first prompt version…"
          />
          <ModelSelector label="Model A" value={modelA} onChange={setModelA} />
        </div>

        {/* Prompt B */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">B</span>
              Prompt B
            </span>
          </div>
          <Textarea
            value={promptB}
            onChange={(e) => setPromptB(e.target.value)}
            rows={6}
            className="resize-none"
            placeholder="Write your second version (change one thing)…"
          />
          <ModelSelector label="Model B" value={modelB} onChange={setModelB} />
        </div>
      </div>

      {/* Controls bar */}
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
            onClick={handleCompare}
            disabled={!canCompare}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0",
              canCompare
                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            <GitCompare className="w-4 h-4" />
            {loading ? "Comparing…" : "Compare"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Side-by-side output */}
      {(outputA || outputB) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
        </div>
      )}
    </div>
  );
}
