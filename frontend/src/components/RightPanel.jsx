
const studyTools = [
  {
    icon: "📝",
    title: "Summarize Notes",
    description: "Make long notes shorter",
    prompt:
      "Help me summarize my study notes into concise points with important concepts.",
  },
  {
    icon: "❓",
    title: "Practice Quiz",
    description: "Test your knowledge",
    prompt:
      "Create 10 practice questions with answers to test my knowledge.",
  },
  {
    icon: "💡",
    title: "Explain a Topic",
    description: "Learn step by step",
    prompt:
      "Explain a difficult topic step by step with simple examples.",
  },
  {
    icon: "📚",
    title: "Study Plan",
    description: "Organize your learning",
    prompt:
      "Create a practical weekly study plan with daily learning goals.",
  },
  {
    icon: "🗂️",
    title: "Make Flashcards",
    description: "Revise important concepts",
    prompt:
      "Create 10 question-and-answer flashcards for revision.",
  },
];

const quickPrompts = [
  "Explain simply",
  "Give examples",
  "Interview questions",
  "Make flashcards",
];

export default function RightPanel() {
  function startTool(prompt) {
    window.dispatchEvent(
      new CustomEvent("study-assistant-prompt", {
        detail: { prompt },
      })
    );
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-slate-900/60 p-5 text-white">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-xl">
          ✨
        </div>

        <div>
          <h2 className="text-lg font-bold">Study Tools</h2>
          <p className="mt-1 text-xs text-slate-400">
            Your personal learning assistant
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        Choose a tool to improve your learning and revision.
      </p>

      {/* Study tools */}
      <div className="mt-6 space-y-3">
        {studyTools.map((tool) => (
          <button
            key={tool.title}
            type="button"
            onClick={() => startTool(tool.prompt)}
            className="group w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/60 hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-2xl transition group-hover:bg-violet-500/20">
                {tool.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-100">
                  {tool.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {tool.description}
                </p>
              </div>

              <span className="text-lg text-slate-500 transition group-hover:translate-x-1 group-hover:text-violet-400">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Study tip */}
      <div className="mt-7 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-slate-900 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="text-sm font-semibold text-violet-300">
            Study Tip
          </h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Break complex topics into smaller parts. Learn one
          concept at a time, use examples, and test yourself
          with practice questions.
        </p>
      </div>

      {/* Quick prompts */}
      <div className="mt-7 border-t border-slate-800 pt-5">
        <h3 className="text-sm font-semibold">Quick Prompts</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => startTool(prompt)}
              className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-violet-500 hover:bg-violet-500/10 hover:text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
          <p className="text-xs text-slate-400">
            ✦ Study smarter, one concept at a time.
          </p>
        </div>
      </div>
    </aside>
  );
}
