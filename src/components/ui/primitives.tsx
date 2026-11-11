import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[#2563EB] text-white hover:bg-[#1D4ED8] border border-transparent shadow-xs disabled:opacity-60",
      secondary:
        "bg-[#101B33] text-white hover:bg-[#1B2B4F] border border-transparent shadow-xs disabled:opacity-60",
      outline:
        "bg-white text-[#172033] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] disabled:opacity-60",
      ghost:
        "bg-transparent text-[#172033] hover:bg-[#F1F5F9] border border-transparent disabled:opacity-60",
      danger:
        "bg-red-600 text-white hover:bg-red-700 border border-transparent disabled:opacity-60",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-9 px-3 text-xs font-semibold rounded-lg",
      md: "h-10 px-4 text-sm font-semibold rounded-lg",
      lg: "h-11 px-6 text-sm font-semibold rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "navy" | "blue" | "slate" | "green" | "amber" | "red";
}

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
    navy: "bg-[#101B33] text-white border-[#101B33]",
    blue: "bg-blue-50 text-[#2563EB] border-blue-200",
    slate: "bg-slate-100 text-[#172033] border-[#E2E8F0]",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-white shadow-2xs",
        className
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none disabled:bg-slate-50 disabled:text-slate-500",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172033] focus:border-[#2563EB] focus:outline-none disabled:bg-slate-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none disabled:bg-slate-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
