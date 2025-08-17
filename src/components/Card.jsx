export default function Card({ title, children, className = "", headerContent }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border ${className}`}>
      {(title || headerContent) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {headerContent}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}