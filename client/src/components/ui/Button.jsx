import { forwardRef } from "react";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-blue-500",
  ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const Button = forwardRef(
  ({ children, className = "", variant = "primary", size = "md", isLoading = false, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={[
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading && <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;
