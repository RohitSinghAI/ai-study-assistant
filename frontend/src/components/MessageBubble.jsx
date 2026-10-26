
import { useState } from "react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`flex w-full items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg text-white shadow-lg shadow-violet-950/20">
          ✦
        </div>
      )}

      {/* Message Content */}
      <div
        className={`group min-w-0 max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
          isUser
            ? "rounded-br-md bg-violet-600 text-white"
            : "rounded-bl-md border border-slate-800 bg-slate-900 text-slate-100"
        }`}
      >
        {/* Message Header */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold opacity-70">
            {isUser ? "You" : "StudyAI"}
          </span>

          {!isUser && message.used_rag && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
              PDF Context
            </span>
          )}
        </div>

        {/* Message Text */}
        <div className="whitespace-pre-wrap break-words text-sm leading-7">
          {message.content || ""}
        </div>

        {/* PDF Source Indicator */}
        {!isUser && message.used_rag && (
          <div className="mt-3 border-t border-slate-700 pt-2">
            <p className="text-xs text-emerald-400">
              ✓ Answer generated using document context
            </p>
          </div>
        )}

        {/* Copy Button for AI Messages */}
        {!isUser && message.content && (
          <div className="mt-3 flex justify-end border-t border-slate-800 pt-2">
            <button
              type="button"
              onClick={copyMessage}
              title="Copy response"
              className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              {copied ? "✓ Copied" : "▢ Copy"}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-xs font-semibold text-white">
          You
        </div>
      )}
    </div>
  );
}
