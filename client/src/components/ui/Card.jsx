export function Card({ as: Component = "div", className = "", children, ...props }) {
  return (
    <Component className={`min-w-0 rounded-lg border border-[#f0dce8] bg-white shadow-[0_18px_45px_-30px_rgba(93,15,81,0.42)] ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`min-w-0 border-b border-[#f4e4ed] px-4 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`min-w-0 p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
