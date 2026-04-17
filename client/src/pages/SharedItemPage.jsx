import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import FileViewerModal from "../components/FileViewerModal";
import { downloadFileWithName } from "../utils/downloadFile";
import {
  ChevronRight,
  Cloud,
  Download,
  File,
  Folder,
  Home,
  Image as ImageIcon,
  Loader,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

function getFileExtension(item) {
  const candidate = (item?.name || item?.url || "").split("?")[0];
  const parts = candidate.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isImageFile(item) {
  const extension = getFileExtension(item);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"].includes(extension);
}

export default function SharedItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rootItem, setRootItem] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);
  const [viewerFile, setViewerFile] = useState(null);

  useEffect(() => {
    const loadSharedItem = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`http://localhost:5000/api/share/${id}`);

        setRootItem(response.data.item);
        setAllItems(response.data.items || []);

        if (response.data.item?.type === "folder") {
          setCurrentFolder(response.data.item);
          setNavigationStack([response.data.item]);
        } else {
          setCurrentFolder(null);
          setNavigationStack([]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load shared item");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSharedItem();
    }
  }, [id]);

  const visibleItems = useMemo(() => {
    if (!rootItem || rootItem.type !== "folder" || !currentFolder) {
      return [];
    }
    return allItems.filter((item) => item.parentId === currentFolder.id);
  }, [allItems, currentFolder, rootItem]);

  const openFolder = (folder) => {
    setCurrentFolder(folder);
    setNavigationStack((prev) => [...prev, folder]);
  };

  const navigateTo = (folder, index) => {
    if (folder === null) {
      setCurrentFolder(rootItem);
      setNavigationStack([rootItem]);
      return;
    }

    setCurrentFolder(folder);
    setNavigationStack((prev) => prev.slice(0, index + 1));
  };

  const handleItemClick = (item) => {
    if (item.type === "folder") {
      openFolder(item);
      return;
    }

    if (item.type === "file" && item.url) {
      setViewerFile(item);
    }
  };

  const handleDownload = async (item) => {
    await downloadFileWithName(item, "download");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading shared item...</p>
        </div>
      </div>
    );
  }

  if (error || !rootItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <p className="text-red-600 font-bold mb-2">Share unavailable</p>
          <p className="text-slate-600 text-sm mb-6">{error || "The shared item could not be found."}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dropzone
          </button>
        </div>
      </div>
    );
  }

  if (rootItem.type === "file") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isImageFile(rootItem) ? (
                <ImageIcon className="h-8 w-8 text-emerald-500 shrink-0" />
              ) : (
                <File className="h-8 w-8 text-indigo-500 shrink-0" />
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-black text-slate-800 truncate">{rootItem.name}</h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Shared file</p>
              </div>
            </div>
            <Cloud className="h-6 w-6 text-indigo-500 shrink-0" />
          </div>

          <div className="p-6 flex flex-wrap gap-3 border-b border-slate-100">
            <button
              onClick={() => setViewerFile(rootItem)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open file
            </button>
            <button
              onClick={() => handleDownload(rootItem)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          {isImageFile(rootItem) && (
            <div className="p-6 bg-slate-100">
              <img
                src={rootItem.url}
                alt={rootItem.name}
                className="max-h-[70vh] w-full object-contain rounded-2xl bg-slate-900"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Folder className="h-8 w-8 text-indigo-500 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-black text-slate-800 truncate">{rootItem.name}</h1>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Shared folder</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to app
            </button>
          </div>

          <div className="px-6 py-4 flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap border-b border-slate-100">
            <button onClick={() => navigateTo(null)} className="hover:text-indigo-600 font-bold transition-colors">
              {rootItem.name}
            </button>
            {navigationStack.slice(1).map((folder, idx) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                <button
                  onClick={() => navigateTo(folder, idx + 1)}
                  className={`hover:text-indigo-600 transition-colors ${idx === navigationStack.length - 2 ? "font-black text-slate-800" : "font-bold"}`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="p-6">
            {visibleItems.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-700 font-bold mb-1">This folder is empty</p>
                <p className="text-sm text-slate-500">No files or subfolders are available in this shared view.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      {item.type === "folder" ? (
                        <Folder className="h-10 w-10 text-slate-400 fill-slate-100 group-hover:text-indigo-500 group-hover:fill-indigo-50 transition-colors" />
                      ) : isImageFile(item) ? (
                        <ImageIcon className="h-10 w-10 text-emerald-500" />
                      ) : (
                        <File className="h-10 w-10 text-indigo-500" />
                      )}

                      {item.type === "file" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 truncate mb-1.5">{item.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.type === "folder" ? "Folder" : item.size || "File"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {viewerFile && (
        <FileViewerModal
          file={viewerFile}
          onClose={() => {
            setViewerFile(null);
          }}
        />
      )}
    </div>
  );
}
