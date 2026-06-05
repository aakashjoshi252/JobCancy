const variants = {
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
  primary: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        variants[variant] || variants.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
