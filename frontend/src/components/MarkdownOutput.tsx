import ReactMarkdown from "react-markdown";

export default function MarkdownOutput({ content }: { content: string }) {
  return (
    <div className="min-w-0 text-sm">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 leading-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-violet-700 dark:text-violet-400 mt-6 mb-3 pb-2 border-b border-violet-100 dark:border-violet-800/50 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 mb-3 space-y-1 marker:text-violet-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 marker:text-violet-600 marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-500 dark:text-slate-400">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 dark:bg-slate-800 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-violet-300 dark:border-violet-700 pl-4 py-2 my-3 bg-violet-50/50 dark:bg-violet-900/20 rounded-r-xl text-sm text-slate-600 dark:text-slate-400 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-slate-200 dark:border-slate-700 my-5" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-800 dark:hover:text-violet-300 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
