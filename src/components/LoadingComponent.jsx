import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingComponent({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-base font-medium">{message}</p>
    </div>
  );
}
