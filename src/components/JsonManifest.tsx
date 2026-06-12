"use client";

import { useEffect, useRef, useState } from "react";

interface JsonManifestProps {
  data: unknown;
  title?: string;
  copyable?: boolean;
}

export function JsonManifest({
  data,
  title = "manifest.json",
  copyable = true,
}: JsonManifestProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — nothing to do.
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-ink shadow-card">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-yellow-400/80" />
            <span className="size-2.5 rounded-full bg-mint/80" />
          </span>
          <span className="font-mono text-xs text-cream/70">{title}</span>
        </div>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className={`tactile rounded-lg px-2.5 py-1 font-mono text-xs font-semibold ${
              copied ? "bg-mint text-ink" : "bg-white/10 text-cream hover:bg-white/20"
            }`}
          >
            {copied ? "copied ✓" : "copy"}
          </button>
        )}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-mint sm:text-sm">
        {json}
      </pre>
    </div>
  );
}
