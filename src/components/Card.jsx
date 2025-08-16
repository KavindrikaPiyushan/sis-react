export default function Card({ title, children, footer }) {
  return (
    <div className="card">
      {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
      <div>{children}</div>
      {footer && <div className="mt-4 border-t pt-3 text-sm text-gray-500">{footer}</div>}
    </div>
  );
}
