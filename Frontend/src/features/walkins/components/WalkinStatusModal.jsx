import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { WALKIN_STATUS_CONFIG, WALKIN_STATUS_OPTIONS } from '../constants/walkin.constant';

const WalkinStatusModal = ({
  isOpen,
  onClose,
  currentStatus = 'NEW',
  initialTargetStatus = null,
  onSave,
  isPending = false
}) => {
  const [targetStatus, setTargetStatus] = useState('NEW');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTargetStatus(initialTargetStatus || currentStatus || 'NEW');
      setNote('');
      setError('');
    }
  }, [isOpen, currentStatus, initialTargetStatus]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isPending) {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetStatus) {
      setError('Please select a valid status.');
      return;
    }
    onSave({ status: targetStatus, note: note.trim() });
  };

  const statusCfg = WALKIN_STATUS_CONFIG[targetStatus] || WALKIN_STATUS_CONFIG.NEW;

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-200 font-urbanist"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Update Walk-in Status</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Change the operational lifecycle stage of this visitor
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all cursor-pointer"
              >
                {WALKIN_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-500">Preview:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}></span>
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Optional Note
              </label>
              <span className="text-[10px] text-neutral-400">
                {note.length} / 3000
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Called the client. Interested in 5-seater cabin."
              rows={3}
              maxLength={3000}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all resize-none disabled:opacity-50"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Adding a note will append it to the activity timeline.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Save Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WalkinStatusModal;
