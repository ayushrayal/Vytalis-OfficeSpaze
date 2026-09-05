import React from 'react';
import { X, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';

const AgreementPreview = ({ isOpen, onClose, agreement }) => {
  if (!isOpen || !agreement || !agreement.url) return null;

  const fileName = agreement.fileName || 'Agreement File';
  const url = agreement.url;
  const isPdf =
    fileName.toLowerCase().endsWith('.pdf') ||
    url.toLowerCase().includes('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-brand-red shrink-0">
              {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate my-0">
                {fileName}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                Managed Office Agreement Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 hover:text-white hover:bg-neutral-700 text-xs font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer"
              aria-label="Close agreement preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-neutral-100 p-3 sm:p-4 flex items-center justify-center overflow-auto relative">
          {isPdf ? (
            <iframe
              src={url}
              title={fileName}
              className="w-full h-full rounded-xl border border-neutral-200 bg-white shadow-xs"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={url}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-neutral-200"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 font-medium shrink-0">
          <span>{isPdf ? 'PDF Document Preview' : 'Image Preview'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementPreview;
