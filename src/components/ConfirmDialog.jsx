import React from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 break-words">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 active:bg-gray-400 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onConfirm}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
