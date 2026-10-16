import { useState } from 'react';

interface CodeBlockProps {
  code: string | null | undefined;
  lang?: string;
  emptyText?: string;
}

export default function CodeBlock({ code, lang = 'JSON', emptyText = 'No content' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const trimmed = code?.trim();

  // Pretty-print JSON if valid, fall back to raw
  let display = trimmed ?? '';
  if (trimmed) {
    try {
      display = JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      display = trimmed;
    }
  }

  const handleCopy = async () => {
    if (!display) return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        {display && (
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            type="button"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <rect x="4" y="1" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1 4h2.5M1 4v6a1 1 0 001 1h5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
      {display ? (
        <pre className="code-block-pre">{display}</pre>
      ) : (
        <div className="code-block-empty">{emptyText}</div>
      )}
    </div>
  );
}
