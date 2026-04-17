import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `accent` — restrained admin/dashboard CTAs (avoids loud red on dark UIs). */
  variant?: "primary" | "secondary" | "ghost" | "accent";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      fullWidth,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-60";
    const variants = {
      primary:
        "bg-[#990808] text-white hover:bg-[#c41e1e] focus:ring-[#EDC537]",
      accent:
        "border border-amber-500/35 bg-amber-500/10 text-amber-100 shadow-sm hover:bg-amber-500/18 hover:border-amber-400/45 focus:ring-amber-500/40",
      secondary:
        "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-700",
      ghost:
        "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100 focus:ring-zinc-500",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
