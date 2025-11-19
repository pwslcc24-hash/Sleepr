import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={
      "h-4 w-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500"
    }
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
