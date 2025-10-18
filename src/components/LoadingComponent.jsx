import React from "react";
import { Loader2 } from "lucide-react";

// LoadingComponent supports a compact mode for inline small loaders
export default function LoadingComponent({ message = "Loading...", compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center py-2 text-gray-600">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
        {message && <span className="text-sm">{message}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[20vh] text-gray-600">
      {spinner === 'circle' ? (
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
      ) : (
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      )}
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
