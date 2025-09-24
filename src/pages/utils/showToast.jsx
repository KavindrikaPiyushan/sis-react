import { toast } from "react-toastify";

export function showToast(type, title, message) {
  const content = (
    <div>
      <div style={{ fontWeight: "bold" }}>{title}</div>
      <div>{message}</div>
    </div>
  );
  if (type === "success") toast.success(content);
  else toast.error(content);
}
