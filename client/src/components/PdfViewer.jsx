import React, { useRef } from 'react';
import { Download, Expand, X } from 'lucide-react';
import { downloadFileWithName } from '../utils/downloadFile';

export default function PdfViewer({ fileUrl, fileName, onClose }) {
  const containerRef = useRef(null);

  const handleDownload = async () => {
    await downloadFileWithName({ name: fileName, url: fileUrl }, 'document.pdf');
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 overflow-auto">
      <div ref={containerRef} className="mx-auto max-w-[95%] min-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
                <X className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[20rem]">{fileName || 'Cloudinary PDF'}</p>
                <p className="text-xs text-slate-500">PDF preview</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleDownload} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <Download className="h-4 w-4" />
              </button>
              <button onClick={handleFullscreen} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <Expand className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-900 p-4">
            <iframe
              src={fileUrl}
              title={fileName || 'File preview'}
              className="w-full h-[80vh] rounded-2xl bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
