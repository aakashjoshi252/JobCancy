export default function StatCard({ icon: Icon, label, value, helper, className = "" }) {
  return (
    <div className={`min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-gray-950">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {helper && <p className="mt-3 text-xs leading-5 text-gray-500">{helper}</p>}
    </div>
  );
}
