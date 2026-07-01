import { forwardRef } from "react";

const variants = {
  primary: "bg-[#5d0f51] text-white hover:bg-[#3f0b38] focus-visible:ring-[#7a0e67] shadow-[0_14px_28px_-20px_rgba(93,15,81,0.72)]",
  secondary: "bg-white text-[#3a2634] border border-[#d9bdcf] hover:bg-[#fff7fb] focus-visible:ring-[#7a0e67]",
  ghost: "text-[#604b5a] hover:bg-[#fff7fb] focus-visible:ring-[#d5a6c7]",
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
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
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
