
import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function UploadPDF({
  documentId,
  setDocumentId,
}) {
  const fileRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progressText, setProgressText] = useState("");

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");
    setProgressText("");

    // Validate file extension.
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    // Validate file size.
    if (file.size > MAX_FILE_SIZE) {
      setError("PDF size 20 MB se kam hona chahiye.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setError("Selected PDF file is empty.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setProgressText("Uploading PDF...");
    setFilename("");

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "PDF upload failed.";

        throw new Error(detail);
      }

      if (!data.success || !data.document_id) {
        throw new Error(
          data.message || "Document ID backend se nahi mila."
        );
      }

      setDocumentId(data.document_id);
      setFilename(data.filename || file.name);
      setSuccess(data.message || "PDF uploaded successfully.");
      setProgressText("");
    } catch (err) {
      setError(
        err.message ||
          "PDF upload nahi ho paya. Backend server check karo."
      );
      setProgressText("");
    } finally {
      setUploading(false);

      // Allow selecting the same file again.
      event.target.value = "";
    }
  }

  function removeDocument() {
    setDocumentId(null);
    setFilename("");
    setError("");
    setSuccess("");
    setProgressText("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function openFilePicker() {
    if (!uploading) {
      fileRef.current?.click();
    }
  }

  return (
    <div className="mb-3">
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        aria-label="Choose PDF file"
      />

      {documentId ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xl">
                📄
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-300">
                  PDF Ready
                </p>

                <p className="truncate text-xs text-slate-400">
                  {filename || "Document uploaded"}
                </p>

                {typeof documentId === "string" && (
                  <p className="mt-1 text-xs text-emerald-400">
                    Ready for document questions
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={removeDocument}
              className="rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Remove
            </button>
          </div>

          {success && (
            <p className="mt-2 text-xs text-emerald-400">
              {success}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          disabled={uploading}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-3 text-left transition hover:border-violet-500 hover:bg-slate-900 disabled:cursor-wait disabled:opacity-60"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xl">
            {uploading ? "⏳" : "📎"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200">
              {uploading
                ? "Processing PDF..."
                : "Upload study PDF"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              PDF format · Maximum 20 MB
            </p>
          </div>

          {!uploading && (
            <span className="text-sm text-violet-400">
              Browse
            </span>
          )}
        </button>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-500" />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {progressText}
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-2 flex items-start justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3"
        >
          <p className="break-words text-xs leading-5 text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="shrink-0 rounded px-2 text-red-300 hover:bg-red-500/10"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
