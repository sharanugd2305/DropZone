import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Expand, X } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfViewer({ fileUrl, fileName, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    console.log('Loading PDF from:', fileUrl);

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      withCredentials: false,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/3.11.174/cmaps/',
    });
    loadingTask.promise
      .then((doc) => {
        console.log('PDF loaded successfully, pages:', doc.numPages);
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPageNum(1);
      })
      .catch((error) => {
        console.error('PDF load error:', error);
        alert('Failed to load PDF: ' + error.message);
      });

    return () => {
      loadingTask.destroy?.();
      setPdfDoc(null);
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdfDoc) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('PDF render error:', error);
      }
    };

    renderPage();
  }, [pdfDoc, pageNum, scale]);

  const changeScale = (delta) => {
    setScale((current) => Math.min(3, Math.max(0.6, current + delta)));
  };

  const changePage = (delta) => {
    setPageNum((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > totalPages) return totalPages;
      return next;
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
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
                <p className="text-xs text-slate-500">{pageNum} / {totalPages}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => changeScale(-0.1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button onClick={() => changeScale(0.1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={() => changePage(-1)} disabled={pageNum <= 1} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => changePage(1)} disabled={pageNum >= totalPages} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={handleDownload} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <Download className="h-4 w-4" />
              </button>
              <button onClick={handleFullscreen} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition">
                <Expand className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-900 p-4 flex items-center justify-center">
            <div className="max-w-full">
              <canvas ref={canvasRef} className="mx-auto max-w-full rounded-2xl bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
