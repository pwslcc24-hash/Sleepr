import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
}

export const Avatar = ({ className, children, ...props }: AvatarProps) => (
  <div
    className={cn(
      "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) =>
  src ? (
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  ) : null;

export const AvatarFallback = ({ children, className }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-sm font-semibold text-slate-600", className)}>{children}</span>
);
