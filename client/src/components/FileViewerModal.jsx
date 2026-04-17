import React, { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";
import { downloadFileWithName } from "../utils/downloadFile";

function getFileExtension(file) {
  const candidate = (file?.name || file?.url || "").split("?")[0];
  const parts = candidate.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isImageFile(file) {
  const extension = getFileExtension(file);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"].includes(extension);
}

function isVideoFile(file) {
  const extension = getFileExtension(file);
  return ["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(extension);
}

function isAudioFile(file) {
  const extension = getFileExtension(file);
  return ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(extension);
}

function isPdfFile(file) {
  return getFileExtension(file) === "pdf";
}

function isTextLikeFile(file) {
  const extension = getFileExtension(file);
  return [
    "txt",
    "md",
    "json",
    "csv",
    "xml",
    "html",
    "css",
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "go",
    "rs",
    "sh",
    "log",
    "yml",
    "yaml",
    "sql",
  ].includes(extension);
}

function isOfficeFile(file) {
  const extension = getFileExtension(file);
  return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension);
}

function getPreviewType(file) {
  if (isImageFile(file)) return "image";
  if (isVideoFile(file)) return "video";
  if (isAudioFile(file)) return "audio";
  if (isPdfFile(file)) return "pdf";
  if (isTextLikeFile(file)) return "text";
  if (isOfficeFile(file)) return "office";
  return "binary";
}

function toHexPreview(buffer, maxBytes = 2048) {
  const bytes = new Uint8Array(buffer.slice(0, maxBytes));
  const lines = [];

  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(8, "0");
    const hex = Array.from(chunk)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join(" ");
    const text = Array.from(chunk)
      .map((value) => (value >= 32 && value <= 126 ? String.fromCharCode(value) : "."))
      .join("");
    lines.push(`${offset}  ${hex.padEnd(47, " ")}  ${text}`);
  }

  return lines.join("\n");
}

export default function FileViewerModal({ file, onClose }) {
  const [textContent, setTextContent] = useState("");
  const [binaryContent, setBinaryContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");

  const previewType = useMemo(() => getPreviewType(file), [file]);

  useEffect(() => {
    let ignore = false;

    const loadContent = async () => {
      if (!file?.url) return;
      if (previewType !== "text" && previewType !== "binary") {
        setTextContent("");
        setBinaryContent("");
        setContentError("");
        return;
      }

      try {
        setIsLoadingContent(true);
        setContentError("");

        if (previewType === "text") {
          const response = await fetch(file.url);
          const content = await response.text();
          if (!ignore) {
            setTextContent(content.slice(0, 500000));
          }
        } else {
          const response = await fetch(file.url);
          const buffer = await response.arrayBuffer();
          if (!ignore) {
            setBinaryContent(toHexPreview(buffer));
          }
        }
      } catch {
        if (!ignore) {
          setContentError("Preview could not be loaded for this file.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingContent(false);
        }
      }
    };

    loadContent();

    return () => {
      ignore = true;
    };
  }, [file, previewType]);

  if (!file) return null;

  const handleDownload = async () => {
    await downloadFileWithName(file, "download");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 overflow-auto">
      <div className="mx-auto max-w-[95%] min-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name || "File preview"}</p>
          </div>

          <button
            onClick={handleDownload}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-900 p-4 flex flex-col items-center justify-center gap-4">
          {previewType === "image" && (
            <img
              src={file.url}
              alt={file.name || "Image preview"}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-lg"
            />
          )}

          {previewType === "video" && (
            <video controls className="max-h-[80vh] w-full rounded-2xl bg-black">
              <source src={file.url} />
              Your browser cannot play this video.
            </video>
          )}

          {previewType === "audio" && (
            <div className="w-full max-w-2xl bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <audio controls className="w-full">
                <source src={file.url} />
                Your browser cannot play this audio.
              </audio>
            </div>
          )}

          {previewType === "pdf" && (
            <iframe
              src={file.url}
              title={file.name || "File preview"}
              className="w-full h-[80vh] rounded-2xl bg-white"
            />
          )}

          {previewType === "office" && (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.url)}`}
              title={file.name || "Office file preview"}
              className="w-full h-[80vh] rounded-2xl bg-white"
            />
          )}

          {previewType === "text" && (
            <div className="w-full h-[80vh] rounded-2xl border border-slate-700 bg-slate-950 overflow-auto">
              {isLoadingContent ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading text content...</div>
              ) : contentError ? (
                <div className="h-full flex items-center justify-center text-red-300 text-sm px-6 text-center">{contentError}</div>
              ) : (
                <pre className="p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap wrap-break-word">{textContent || "No text content available."}</pre>
              )}
            </div>
          )}

          {previewType === "binary" && (
            <div className="w-full h-[80vh] rounded-2xl border border-slate-700 bg-slate-950 overflow-auto">
              {isLoadingContent ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading binary content...</div>
              ) : contentError ? (
                <div className="h-full flex items-center justify-center text-red-300 text-sm px-6 text-center">{contentError}</div>
              ) : (
                <pre className="p-4 text-xs leading-5 text-emerald-200 whitespace-pre overflow-x-auto">{binaryContent || "No binary preview available."}</pre>
              )}
            </div>
          )}

          <p className="text-xs text-slate-300 text-center">
            This file is rendered in-app. Use download if the format has limited browser preview support.
          </p>
        </div>
      </div>
    </div>
  );
}
