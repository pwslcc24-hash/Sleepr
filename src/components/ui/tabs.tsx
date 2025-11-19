import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue);
  const activeValue = controlledValue ?? value;

  const handleChange = (next: string) => {
    if (!controlledValue) {
      setValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)} {...props} />
);

export const TabsTrigger = ({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");
  const isActive = context.value === value;
  return (
    <button
      onClick={() => context.setValue(value)}
      className={cn(
        "flex flex-1 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all",
        isActive ? "bg-white text-indigo-600 shadow" : "text-slate-500",
        className
      )}
      {...props}
    />
  );
};

export const TabsContent = ({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");
  if (context.value !== value) return null;
  return <div className={cn("mt-4", className)} {...props} />;
};
