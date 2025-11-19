import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "icon";
};

const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantMap: Record<string, string> = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  ghost: "text-slate-600 hover:bg-slate-100",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
};

const sizeMap: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantMap[variant], sizeMap[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
