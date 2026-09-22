import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Archive,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { LEAD_STATUS_CONFIG } from '../constants/leads.constant';

const STATUS_LIST = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED', 'LOST'];

const BulkActionBar = ({
  selectedCount = 0,
  isAllMatchingSelected = false,
  totalMatchingCount = 0,
  currentPageCount = 0,
  onSelectAllMatching,
  onClearSelection,
  currentView = 'active',
  onBulkAssign,
  onBulkStatus,
  onBulkArchive,
  onBulkRestore,
  onBulkPermanentDelete,
  isPending = false,
  isAdmin = false,
  canUpdate = false,
  canDelete = false,
  assignees = []
}) => {
  // Modal states
  const [modalType, setModalType] = useState(null); // 'assign' | 'status' | 'archive' | 'restore' | 'delete'
  const [selectedAssignee, setSelectedAssignee] = useState('unassigned');
  const [selectedStatus, setSelectedStatus] = useState('NEW');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  if (selectedCount === 0 && !isAllMatchingSelected) {
    return null;
  }

  const effectiveCount = isAllMatchingSelected ? totalMatchingCount : selectedCount;

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedAssignee('unassigned');
    setSelectedStatus('NEW');
    setDeleteConfirmationText('');
  };

  const handleConfirmAssign = () => {
    const val = selectedAssignee === 'unassigned' ? null : selectedAssignee;
    onBulkAssign(val);
    handleCloseModal();
  };

  const handleConfirmStatus = () => {
    onBulkStatus(selectedStatus);
    handleCloseModal();
  };

  const handleConfirmArchive = () => {
    onBulkArchive();
    handleCloseModal();
  };

  const handleConfirmRestore = () => {
    onBulkRestore();
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationText.trim() === 'DELETE') {
      onBulkPermanentDelete();
      handleCloseModal();
    }
  };

  return (
    <>
      {/* ─── SELECT ALL MATCHING BANNER (when all on page selected) ─── */}
      {!isAllMatchingSelected &&
        currentPageCount > 0 &&
        selectedCount === currentPageCount &&
        totalMatchingCount > currentPageCount && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 text-xs text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-2 font-urbanist animate-fade-in mb-3">
            <span>
              All <span className="font-bold">{selectedCount}</span> leads on this page are selected.
            </span>
            <button
              type="button"
              onClick={onSelectAllMatching}
              className="text-[#ED1F23] hover:underline font-bold cursor-pointer"
            >
              Select all {totalMatchingCount.toLocaleString()} matching leads
            </button>
          </div>
        )}

      {isAllMatchingSelected && (
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 font-urbanist animate-fade-in mb-3">
          <span>
            All <span className="font-bold">{totalMatchingCount.toLocaleString()}</span> matching leads across all pages are selected.
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-neutral-600 hover:text-neutral-900 font-bold underline cursor-pointer"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ─── FLOATING BULK ACTION BAR ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-[calc(100%-2rem)] sm:w-auto font-urbanist">
        <div className="bg-neutral-900/95 backdrop-blur-md text-white border border-neutral-700/80 shadow-2xl rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between sm:justify-start gap-3 animate-fade-in">
          {/* Selected Count Indicator */}
          <div className="flex items-center gap-2.5 pl-1 pr-2 sm:border-r sm:border-neutral-700/80">
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold bg-[#ED1F23] text-white rounded-full">
              {effectiveCount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold tracking-tight text-neutral-200 hidden sm:inline">
              Selected
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* ACTIVE VIEW ACTIONS */}
            {currentView === 'active' && (
              <>
                {/* Bulk Assign (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setModalType('assign')}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-xs font-semibold text-neutral-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Assign</span>
                  </button>
                )}

                {/* Bulk Status (Admin or meta_leads:update) */}
                {(isAdmin || canUpdate) && (
                  <button
                    type="button"
                    onClick={() => setModalType('status')}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-xs font-semibold text-neutral-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status</span>
                  </button>
                )}

                {/* Bulk Archive (Admin or meta_leads:delete) */}
                {(isAdmin || canDelete) && (
                  <button
                    type="button"
                    onClick={() => setModalType('archive')}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-xs font-semibold text-neutral-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Archive</span>
                  </button>
                )}
              </>
            )}

            {/* ARCHIVED VIEW ACTIONS */}
            {currentView === 'archived' && (
              <>
                {/* Bulk Restore (Admin or meta_leads:delete) */}
                {(isAdmin || canDelete) && (
                  <button
                    type="button"
                    onClick={() => setModalType('restore')}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-xs font-semibold text-neutral-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restore</span>
                  </button>
                )}

                {/* Bulk Permanent Delete (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setModalType('delete')}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-xs font-semibold text-rose-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Permanent Delete</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Dismiss / Deselect Button */}
          <button
            type="button"
            onClick={onClearSelection}
            disabled={isPending}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer ml-auto"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── MODAL: BULK ASSIGN ─── */}
      {modalType === 'assign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-urbanist animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Bulk Assign Leads</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Assign {effectiveCount.toLocaleString()} selected leads to an active staff member or unassign them.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Select Assignee</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#ED1F23]/20 focus:border-[#ED1F23] cursor-pointer"
              >
                <option value="unassigned">— Unassign Leads —</option>
                {assignees.map((u) => (
                  <option key={u.id || u._id} value={u.id || u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ED1F23] hover:bg-[#ED1F23]/90 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: BULK STATUS ─── */}
      {modalType === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-urbanist animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Bulk Update Status</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Transition {effectiveCount.toLocaleString()} selected leads to a new CRM status.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_LIST.map((st) => {
                  const cfg = LEAD_STATUS_CONFIG[st] || { label: st };
                  const isCurrent = selectedStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#ED1F23] bg-[#ED1F23]/5 text-[#ED1F23] shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatus}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ED1F23] hover:bg-[#ED1F23]/90 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Apply Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: BULK ARCHIVE ─── */}
      {modalType === 'archive' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-urbanist animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Archive Selected Leads</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  You are about to archive <span className="font-bold text-neutral-800">{effectiveCount.toLocaleString()}</span> leads.
                  Archived leads will be hidden from the active list and can be restored at any time.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Archive Leads</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: BULK RESTORE ─── */}
      {modalType === 'restore' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-urbanist animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Restore Archived Leads</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  You are about to restore <span className="font-bold text-neutral-800">{effectiveCount.toLocaleString()}</span> leads back into the active workspace.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Restore Leads</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PERMANENT DELETE (STRICT CONFIRMATION) ─── */}
      {modalType === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-urbanist animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-900">PERMANENT DELETE</h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  You are about to permanently purge <span className="font-bold text-rose-600">{effectiveCount.toLocaleString()}</span> archived leads and all associated activity logs. This action <span className="font-bold text-neutral-900">CANNOT</span> be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-800 space-y-1.5">
              <p className="font-semibold">To confirm permanent deletion, type <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-300">DELETE</span> below:</p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.trim() !== 'DELETE' || isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionBar;
