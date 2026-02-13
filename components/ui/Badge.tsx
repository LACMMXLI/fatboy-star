import { HTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Badge = ({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'high' | 'pending' | 'resolved' | 'in_progress' }) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700',
    high: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-blue-100 text-blue-700',
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
