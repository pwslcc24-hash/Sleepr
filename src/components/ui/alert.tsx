import * as React from "react";
import { cn } from "@/lib/utils";

export const Alert = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="alert"
    className={cn(
      "flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700",
      className
    )}
    {...props}
  />
);

export const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm text-slate-600", className)} {...props} />
);
