import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Defaults match dark shells (admin + auth). On a light page, pass
 * `className` on the input for a light field, e.g. `!bg-white !text-zinc-900 !border-zinc-300`.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium !text-zinc-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-zinc-100 shadow-sm transition placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/35 ${
            error ? "border-red-500 ring-red-500/20" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
