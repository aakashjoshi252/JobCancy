export function Card({ as: Component = "div", className = "", children, ...props }) {
  return (
    <Component className={`min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`min-w-0 border-b border-gray-100 px-4 py-3 ${className}`} {...props}>
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
