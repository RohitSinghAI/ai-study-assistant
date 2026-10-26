
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function Sidebar({
  chatId,
  setChatId,
  setMessages,
  onNewChat,
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState("");

  // Fetch all recent chats from backend.
  const fetchChats = useCallback(async () => {
    setLoadingChats(true);

    try {
      const response = await fetch(`${API_URL}/chats`);

      if (!response.ok) {
        throw new Error("Failed to load recent chats.");
      }

      const data = await response.json();

      setChats(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError(
        "Backend connect nahi ho raha. Check karo ki server port 8000 par running hai."
      );
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Refresh sidebar after a new message creates or updates a chat.
  useEffect(() => {
    function handleRefresh() {
      fetchChats();
    }

    window.addEventListener(
      "study-assistant-refresh-chats",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "study-assistant-refresh-chats",
        handleRefresh
      );
    };
  }, [fetchChats]);

  // Start a blank chat.
  function createNewChat() {
    setError("");
    onNewChat();
  }

  // Load a selected chat's messages.
  async function openChat(id) {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/chats/${id}`);

      if (!response.ok) {
        throw new Error("Chat history load nahi hui.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid chat history received.");
      }

      setChatId(id);

      setMessages(
        data.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );

      // The backend does not persist a document ID per chat.
      window.dispatchEvent(
        new CustomEvent("study-assistant-clear-document")
      );
    } catch (err) {
      setError(err.message || "Chat load nahi hui.");
    } finally {
      setLoading(false);
    }
  }

  // Delete a chat.
  async function deleteChat(id) {
    const confirmed = window.confirm(
      "Kya aap is chat ko permanently delete karna chahte hain?"
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/chats/${id}`, {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Chat delete nahi hui."
        );
      }

      setChats((previous) =>
        previous.filter((chat) => chat.id !== id)
      );

      if (String(chatId) === String(id)) {
        onNewChat();
      }
    } catch (err) {
      setError(err.message || "Chat delete karne mein error.");
    }
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-4 text-white">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-xl shadow-lg shadow-violet-950/30">
          ✦
        </div>

        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight">
            StudyAI
          </h1>
          <p className="truncate text-xs text-slate-400">
            Your AI Study Assistant
          </p>
        </div>
      </div>

      {/* New chat */}
      <button
        type="button"
        onClick={createNewChat}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-medium transition hover:bg-violet-500 active:scale-[0.98]"
      >
        <span className="text-xl">+</span>
        New Chat
      </button>

      {/* Recent chats heading */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Chats
        </h2>

        <button
          type="button"
          onClick={fetchChats}
          disabled={loadingChats}
          title="Refresh chats"
          aria-label="Refresh chats"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          <span className={loadingChats ? "inline-block animate-spin" : ""}>
            ↻
          </span>
        </button>
      </div>

      {/* Chat list */}
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {loadingChats && chats.length === 0 && (
          <p className="py-4 text-sm text-slate-500">
            Loading chats...
          </p>
        )}

        {!loadingChats && chats.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-slate-800 px-3 py-6 text-center">
            <p className="text-2xl">💬</p>
            <p className="mt-2 text-sm text-slate-400">
              No chats yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Start a new conversation.
            </p>
          </div>
        )}

        {chats.map((chat) => {
          const isActive =
            String(chatId) === String(chat.id);

          return (
            <div
              key={chat.id}
              className={`group flex items-center gap-1 rounded-xl transition ${
                isActive
                  ? "bg-slate-800"
                  : "hover:bg-slate-800/70"
              }`}
            >
              <button
                type="button"
                onClick={() => openChat(chat.id)}
                disabled={loading}
                className="min-w-0 flex-1 px-3 py-3 text-left disabled:opacity-50"
              >
                <span className="block truncate text-sm">
                  {chat.title || "New Chat"}
                </span>

                {chat.created_at && (
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {chat.created_at}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => deleteChat(chat.id)}
                title="Delete chat"
                aria-label={`Delete ${chat.title || "chat"}`}
                className="mr-1 shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="break-words text-xs leading-5 text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchChats}
            className="mt-2 text-xs font-medium text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 font-semibold text-violet-300">
            R
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              My Workspace
            </p>
            <p className="truncate text-xs text-slate-400">
              AI Study Assistant
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
