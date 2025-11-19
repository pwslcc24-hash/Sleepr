import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  return (
    <button
      ref={ref}
      onClick={(event) => {
        onClick?.(event);
        context.setOpen(!context.open);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = ({ className, children, align = "start" }: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) => {
  const context = React.useContext(DropdownContext);
  if (!context || !context.open) return null;
  const alignment = align === "end" ? "right-0" : "left-0";
  return (
    <div
      className={cn(
        "absolute z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-xl",
        alignment,
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuItem must be used within DropdownMenu");
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        context.setOpen(false);
      }}
      {...props}
    />
  );
};
