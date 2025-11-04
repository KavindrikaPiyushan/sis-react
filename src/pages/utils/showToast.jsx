import { toast } from "react-toastify";

export function showToast(type, title, message) {
  const content = (
    <div className="flex flex-col gap-1 sm:gap-2">
      <div className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
        {title}
      </div>
      <div className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
        {message}
      </div>
    </div>
  );
  
  const toastOptions = {
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };
  
  if (type === "success") {
    toast.success(content, toastOptions);
  } else {
    toast.error(content, toastOptions);
  }
}
