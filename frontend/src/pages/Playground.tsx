import { useState } from "react";
import { Copy, Check, Zap, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import MarkdownOutput from "@/components/MarkdownOutput";
import ModelSelector from "@/components/ModelSelector";
import { generatePlayground } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

const SYSTEM_PRESETS = [
  {
    label: "Marketing Assistant",
    value: "You are a helpful marketing assistant. Help the user with any marketing-related task.",
  },
  {
    label: "Brand Strategist",
    value: "You are a senior brand strategist with 15 years of experience. Provide strategic, insightful marketing advice.",
  },
  {
    label: "Copywriter",
    value: "You are a world-class copywriter known for compelling, conversion-focused writing. Write engaging marketing copy.",
  },
  {
    label: "Social Media Manager",
    value: "You are a social media manager who creates viral, engaging content. You understand platform algorithms and audience engagement.",
  },
  {
    label: "SEO Specialist",
    value: "You are an SEO expert. Help optimize content for search engines while maintaining readability and user value.",
  },
];

export default function Playground() {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PRESETS[0].value);
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [improvingPrompt, setImprovingPrompt] = useState(false);

  async function handleImprovePrompt() {
    if (!prompt.trim()) return;
    setImprovingPrompt(true);
    setError("");
    try {
      const result = await generatePlayground({
        prompt: `Here is my current prompt:\n\n"${prompt}"\n\nRewrite this as a single, improved prompt that is more specific, detailed, and likely to produce better AI output for marketing purposes. Return ONLY the improved prompt text itself — no explanations, no labels, no preamble.`,
        system_prompt: "You are an expert prompt engineer specializing in marketing AI applications. When given a prompt, rewrite it to be more specific, targeted, and effective. Output only the improved prompt — nothing else.",
        temperature: 0.4,
        model,
        session_id: getSessionId(),
      });
      setPrompt(result.response.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve prompt");
    } finally {
      setImprovingPrompt(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await generatePlayground({
        prompt,
        system_prompt: systemPrompt,
        temperature,
        model,
        session_id: getSessionId(),
      });
      setOutput(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Playground</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Free-form experimentation — try any marketing prompt, swap models, and adjust creativity.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Settings panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Settings</p>

          <ModelSelector label="AI Model" value={model} onChange={setModel} />

          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              AI Role
            </p>
            <select
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-2"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            >
              {SYSTEM_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="text-xs resize-none"
              placeholder="Or write a custom system prompt…"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Creativity
              </p>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
                {temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={1}
              step={0.1}
            />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
        </div>

        {/* Input + Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className={cn(
            "bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all duration-200",
            prompt.trim()
              ? "border-violet-400 dark:border-violet-600 shadow-sm shadow-violet-100 dark:shadow-violet-900/20"
              : "border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your Prompt</p>
              <button
                onClick={handleImprovePrompt}
                disabled={improvingPrompt || !prompt.trim()}
                title="Get AI coaching on how to improve this prompt"
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all",
                  improvingPrompt || !prompt.trim()
                    ? "text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    : "text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                )}
              >
                <Sparkles className="w-3 h-3" />
                {improvingPrompt ? "Improving…" : "Improve my prompt"}
              </button>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
              placeholder='Try: &quot;Write a LinkedIn post announcing our new AI-powered project management tool for remote teams. Make it engaging and professional.&quot;'
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">{prompt.length} chars</span>
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                  loading || !prompt.trim()
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                )}
              >
                <Zap className="w-3.5 h-3.5" />
                {loading ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {output && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Output</p>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  {copied ? (
                    <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <MarkdownOutput content={output} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
