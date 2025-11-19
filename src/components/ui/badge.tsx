import { cn } from "@/lib/utils";
import * as React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  const styles: Record<string, string> = {
    default: "bg-indigo-100 text-indigo-700",
    secondary: "bg-slate-100 text-slate-700",
    outline: "border border-slate-200 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        styles[variant],
        className
      )}
      {...props}
    />
  );
};
