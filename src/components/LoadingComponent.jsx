import React from "react";
import { Loader2 } from "lucide-react";

/**
 * LoadingComponent
 * @param {string} message - The loading message to display
 * @param {string} spinner - 'default' (icon) or 'circle' (large border spinner)
 */
export default function LoadingComponent({ message = "Loading...", spinner = "default" }) {
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
