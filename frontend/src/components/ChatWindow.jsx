
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import UploadPDF from "./UploadPDF";

const API_URL = "http://127.0.0.1:8000";

const suggestions = [
  "Explain machine learning simply",
  "Give me Python practice questions",
  "Summarize a difficult topic",
  "Explain neural networks with examples",
];

export default function ChatWindow({
  chatId,
  setChatId,
  messages,
  setMessages,
  documentId,
  setDocumentId,
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Automatically scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  // Receive prompts from the RightPanel component.
  useEffect(() => {
    function handleSuggestedPrompt(event) {
      if (event.detail?.prompt) {
        setInput(event.detail.prompt);
        textareaRef.current?.focus();
      }
    }

    window.addEventListener(
      "study-assistant-prompt",
      handleSuggestedPrompt
    );

    return () => {
      window.removeEventListener(
        "study-assistant-prompt",
        handleSuggestedPrompt
      );
    };
  }, []);

  useEffect(() => {
  function clearDocument() {
    setDocumentId(null);
  }

  window.addEventListener(
    "study-assistant-clear-document",
    clearDocument
  );

  return () => {
    window.removeEventListener(
      "study-assistant-clear-document",
      clearDocument
    );
  };
}, [setDocumentId]);

  // Send a message to the FastAPI backend.
  async function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || sending) return;

    setInput("");
    setError("");
    setSending(true);

    // Show the user's message immediately.
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: text,
      },
    ]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          message: text,
          document_id: documentId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "AI response nahi mil paya.";

        throw new Error(detail);
      }

      if (data.chat_id != null) {
        setChatId(data.chat_id);
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.response || "No response received.",
          used_rag: Boolean(data.used_rag),
        },
      ]);

      // Notify Sidebar to refresh recent chats.
      window.dispatchEvent(
        new CustomEvent("study-assistant-refresh-chats")
      );
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho paya. Check karo ki FastAPI server running hai."
      );

      // Restore the message so the user can retry.
      setInput(text);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  return (
    <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-slate-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6">
        <div>
          <h2 className="font-semibold tracking-tight">
            AI Study Assistant
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Ask questions and learn smarter
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-300">
            Ready
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {messages.length === 0 ? (
          <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-16">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-950/40">
              <span className="text-3xl">✦</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What do you want to learn?
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
              Ask questions, understand complex topics, practice
              for interviews, or upload a PDF to study.
            </p>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300 transition hover:border-violet-500/60 hover:bg-slate-900"
                >
                  <span>{suggestion}</span>
                  <span className="ml-2 text-violet-400 transition group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${chatId ?? "new"}-${index}`}
                message={message}
              />
            ))}

            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                  ✦
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <p className="text-sm text-slate-400">
                    AI is thinking...
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 p-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <UploadPDF
            documentId={documentId}
            setDocumentId={setDocumentId}
          />

          {error && (
            <div
              role="alert"
              className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              <p className="break-words">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="shrink-0 rounded px-2 hover:bg-red-500/10"
              >
                ×
              </button>
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-2 transition focus-within:border-violet-500"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                documentId
                  ? "Ask a question about your PDF..."
                  : "Ask anything..."
              }
              rows={2}
              disabled={sending}
              aria-label="Message input"
              className="max-h-40 min-h-12 w-full resize-y bg-transparent px-3 py-3 text-sm leading-6 outline-none placeholder:text-slate-500 disabled:opacity-60"
            />

            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <p className="text-xs text-slate-500">
                Enter to send · Shift + Enter for new line
              </p>

              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? "…" : "↑"}
              </button>
            </div>
          </form>

          <p className="mt-3 text-center text-xs text-slate-500">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </section>
  );
}
