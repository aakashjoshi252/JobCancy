const variants = {
  neutral: "bg-[#fff7fb] text-[#725b6b] ring-[#ead8e3]",
  primary: "bg-[#f7eef9] text-[#5d0f51] ring-[#d8b6d0]",
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
