"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  productName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full transform transition-all">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Delete Product</h2>
            </div>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-sm font-semibold text-slate-900 mb-4 break-words">
              "{productName}"?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed from your catalog.
              </p>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Product
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
