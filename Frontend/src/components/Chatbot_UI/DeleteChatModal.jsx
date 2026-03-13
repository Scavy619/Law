import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

const DeleteChatModal = ({ isOpen, onClose, onConfirm, chatTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={!isDeleting ? onClose : undefined}
    >
      <div
        className="bg-white dark:bg-[#1a181a] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#80609F]/30 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Delete Conversation
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete this conversation?
          </p>

          {chatTitle && (
            <div className="p-3 bg-gray-50 dark:bg-black/40 rounded-lg border border-gray-100 dark:border-white/5 mb-4">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                "{chatTitle}"
              </p>
            </div>
          )}

          <p className="text-sm text-red-500/90 dark:text-red-400">
            This action cannot be undone and will permanently remove all messages in this chat.
          </p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-black/20">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
