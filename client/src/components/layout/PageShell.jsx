export function PageShell({ children, className = "", size = "xl" }) {
  const widths = {
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <section className={`w-full ${className}`}>
      <div className={`mx-auto w-full ${widths[size] || widths.xl} px-4 py-6 sm:px-6 lg:px-8`}>
        {children}
      </div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, actions, meta, className = "" }) {
  return (
    <div className={`mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
