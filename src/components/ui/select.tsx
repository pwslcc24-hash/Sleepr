import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value?: string;
  placeholder?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const activeValue = value ?? internalValue;

  const handleChange = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onValueChange?.(val);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{ value: activeValue, open, setOpen, onValueChange: handleChange }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");
  const selectedLabel = context.value ?? placeholder ?? "Select";
  return <span className="text-left text-sm text-slate-600">{selectedLabel}</span>;
};

export const SelectContent = ({ className, children }: React.HTMLAttributes<HTMLDivElement>) => {
  const context = React.useContext(SelectContext);
  if (!context || !context.open) return null;
  return (
    <div
      className={cn(
        "absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");
  const isActive = context.value === value;
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center px-4 py-2 text-left text-sm",
        isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
      )}
      onClick={() => context.onValueChange?.(value)}
    >
      {children}
    </button>
  );
};
