export default function FormField({ id, label, error, children, hint }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-[#4b3444]">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[#8b7584]">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
