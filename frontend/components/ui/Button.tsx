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
        "bg-[#EB523F] text-white shadow-[4px_4px_0_#161015] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#ff5c46] hover:shadow-[2px_2px_0_#161015] focus:ring-[#AAE847]",
      accent:
        "border border-amber-500/35 bg-amber-500/10 text-amber-100 shadow-sm hover:bg-amber-500/18 hover:border-amber-400/45 focus:ring-amber-500/40",
      secondary:
        "border-[3px] border-[#161015] bg-[#EEEDEE] text-[#161015] shadow-[4px_4px_0_#161015] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#E9DFE5] focus:ring-[#EA3699] dark:border-[#EEEDEE]/40 dark:bg-[#161015] dark:text-[#EEEDEE] dark:hover:bg-[#1f1820]",
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
