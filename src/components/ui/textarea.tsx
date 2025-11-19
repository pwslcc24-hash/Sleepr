import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
