export function Card({ as: Component = "div", className = "", children, ...props }) {
  return (
    <Component className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`border-b border-gray-100 px-4 py-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
