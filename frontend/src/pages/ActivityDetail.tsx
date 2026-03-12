import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Zap, Search, Loader2, Check, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import MarkdownOutput from "@/components/MarkdownOutput";
import ModelSelector from "@/components/ModelSelector";
import { getActivity, generateActivity, generatePlayground, type Activity, type InputField } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { ICON_MAP, DEFAULT_ICON } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "activity" | "instructions";

export default function ActivityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [fields, setFields] = useState<InputField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [researchingCompetitors, setResearchingCompetitors] = useState(false);
  const [researchError, setResearchError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleResearchCompetitors() {
    const product = formData["product"] || "";
    if (!product.trim()) {
      setResearchError("Fill in \"Your Product\" first so AI knows what to search for.");
      return;
    }
    setResearchingCompetitors(true);
    setResearchError("");
    try {
      const result = await generatePlayground({
        prompt: `Product description: ${product}\n\nList exactly 5 well-known direct competitors for this product. Return ONLY the competitor names, one per line, no numbering, no extra text.`,
        system_prompt: "You are a market research expert. Given a product description, identify its 5 most direct and well-known competitors. Respond with only the competitor names, one per line.",
        temperature: 0.3,
        session_id: getSessionId(),
        model,
      });
      const names = result.response
        .split("\n")
        .map((l) => l.replace(/^[-*\d.]+\s*/, "").trim())
        .filter(Boolean)
        .join(", ");
      setFormData((prev) => ({ ...prev, competitors: names }));
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setResearchingCompetitors(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    getActivity(slug).then((a) => {
      setActivity(a);
      const parsed: InputField[] = JSON.parse(a.input_fields);
      setFields(parsed);
      try {
        const examples = JSON.parse(a.example_inputs);
        setFormData(examples);
      } catch {
        setFormData({});
      }
    });
  }, [slug]);

  function buildPrompt(): string {
    if (!activity) return "";
    return Object.entries(formData)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const field = fields.find((f) => f.name === k);
        return `${field?.label || k}: ${v}`;
      })
      .join("\n");
  }

  async function handleGenerate() {
    if (!slug) return;
    const prompt = buildPrompt();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const result = await generateActivity(slug, {
        prompt,
        session_id: getSessionId(),
        temperature,
        model,
      });
      setOutput(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400 dark:text-slate-500 text-sm">Loading activity…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
        <Link to="/activities" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Activities
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{activity.name}</span>
      </nav>

      {/* Activity header */}
      <div className="flex items-start gap-4">
        <div className="text-3xl">
          {ICON_MAP[activity.icon as keyof typeof ICON_MAP] ?? DEFAULT_ICON}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activity.name}</h1>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full">
              {activity.category}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{activity.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {(["activity", "instructions"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2",
              activeTab === tab
                ? "border-violet-600 text-violet-700 dark:text-violet-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {tab === "instructions" ? "Instructions & Tips" : "Activity"}
          </button>
        ))}
      </div>

      {/* Instructions & Tips tab */}
      {activeTab === "instructions" && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Instructions</h2>
            <MarkdownOutput content={activity.instructions} />
          </div>
          {activity.tips && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
              <h2 className="font-semibold text-amber-800 dark:text-amber-400 mb-3">💡 Tips</h2>
              <div className="text-amber-900 dark:text-amber-300 text-sm">
                <MarkdownOutput content={activity.tips} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity tab */}
      {activeTab === "activity" && (
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6" style={{ height: "calc(100vh - 160px)" }}>
          {/* Input Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 overflow-y-auto h-full">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Input</p>

            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {field.label}
                </label>
                {/* Auto-research button for competitors field */}
                {slug === "competitive-intelligence-lab" && field.name === "competitors" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleResearchCompetitors}
                      disabled={researchingCompetitors || !formData["product"]?.trim()}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                        researchingCompetitors || !formData["product"]?.trim()
                          ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                          : "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                      )}
                    >
                      {researchingCompetitors
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Researching…</>
                        : <><Search className="w-3.5 h-3.5" /> Auto-research competitors</>}
                    </button>
                    {!formData["product"]?.trim() && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">Fill in "Your Product" first to enable auto-research.</p>
                    )}
                    {researchError && (
                      <p className="text-xs text-red-500 dark:text-red-400">{researchError}</p>
                    )}
                  </div>
                )}
                {field.type === "textarea" ? (
                  <Textarea
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    rows={4}
                    className="resize-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                  >
                    <option value="">Select…</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "multiselect" ? (
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map((opt) => {
                      const selected = (formData[field.name] || "").split(", ").includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            const current = (formData[field.name] || "")
                              .split(", ")
                              .filter(Boolean);
                            const next = selected
                              ? current.filter((c) => c !== opt)
                              : [...current, opt];
                            setFormData((prev) => ({ ...prev, [field.name]: next.join(", ") }));
                          }}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-all",
                            selected
                              ? "bg-violet-600 text-white"
                              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <ModelSelector label="AI Model" value={model} onChange={setModel} />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
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
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                loading
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">AI Output</p>
              {output && (
                <button
                  onClick={handleCopy}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium transition-all px-2.5 py-1 rounded-lg border",
                    copied
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              {output ? (
                <MarkdownOutput content={output} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <Zap className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                  <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
                    Fill in the form and click Generate<br />to see AI output here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

