import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Trash2 } from "lucide-react";

const DeleteChatModal = ({ isOpen, onClose, onConfirm, chatTitle, isDeleting }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-4 py-3 sm:py-6 overflow-y-auto"
      onClick={!isDeleting ? onClose : undefined}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh] overflow-hidden border border-gray-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} />
            Delete Conversation
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this conversation?
          </p>

          {chatTitle && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
              <p className="text-sm font-medium text-gray-800 break-words">
                "{chatTitle}"
              </p>
            </div>
          )}

          <p className="text-sm text-red-500/90">
            This action cannot be undone and will permanently remove all messages in this chat.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-gray-700 font-medium border border-gray-200 bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete Chat"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteChatModal;
