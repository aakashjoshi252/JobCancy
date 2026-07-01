export default function StatCard({ icon: Icon, label, value, helper, className = "" }) {
  return (
    <div className={`min-w-0 rounded-lg border border-[#f0dce8] bg-white p-4 shadow-[0_18px_45px_-30px_rgba(93,15,81,0.42)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#7b6575]">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-[#261723]">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#ead8e3] bg-[#fff7fb] text-[#5d0f51]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      {helper && <p className="mt-3 text-xs leading-5 text-[#7b6575]">{helper}</p>}
    </div>
  );
}
