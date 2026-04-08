import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn-style `cn()` helper: merges Tailwind classes and handles conditional classNames.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

