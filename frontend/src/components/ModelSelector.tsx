import { useEffect, useState } from "react";
import { listModels, type ModelInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function ModelSelector({ value, onChange, label, className }: Props) {
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    listModels()
      .then(({ models: m, default: d }) => {
        setModels(m);
        if (!value) onChange(d);
      })
      .catch(console.error);
  }, []);

  return (
    <div className={className}>
      {label && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
          {label}
        </p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
          "disabled:opacity-50"
        )}
        disabled={models.length === 0}
      >
        {models.length === 0 ? (
          <option value="">Loading models…</option>
        ) : (
          models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
