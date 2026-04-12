"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-zinc-200 bg-white text-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
            SD
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Student Docs</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300">
              Manage records and uploads
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/">
            Dashboard
          </Link>
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/students">
            Students
          </Link>
          <Link className="hover:text-zinc-600 dark:hover:text-zinc-200" href="/students/new">
            Add Student
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              "rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium",
              "hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
            )}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}

