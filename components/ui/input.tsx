"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-500 shadow-sm outline-none",
          "focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-400",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

